import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import verifyToken from '../controllers/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Generate a share link for a chat
router.post('/chat/:id/share', verifyToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { permission = 'view' } = req.body;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat || chat.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let sharedCode = chat.sharedCode;
    if (!sharedCode) {
      sharedCode = crypto.randomBytes(6).toString('hex');
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        isShared: true,
        sharedCode: sharedCode,
        sharePermission: permission,
      },
    });

    const shareLink = `http://localhost:3001/shared-chat/${sharedCode}`;
    return res.status(200).json({
      success: true,
      shareLink,
      shareCode: sharedCode,
      permission: updatedChat.sharePermission,
    });
  } catch (error) {
    console.error('Share chat error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get existing share link for a chat
router.get('/chat/:id/share', verifyToken, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat || chat.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!chat.isShared || !chat.sharedCode) {
      return res.status(200).json({ shareLink: '', permission: 'view' });
    }

    const shareLink = `http://localhost:3001/shared-chat/${chat.sharedCode}`;
    return res.status(200).json({
      shareLink,
      permission: chat.sharePermission,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Access a shared chat
router.get('/shared/:sharedCode', async (req, res) => {
  try {
    const { sharedCode } = req.params;

    const chat = await prisma.chat.findUnique({
      where: { sharedCode },
      include: { history: true },
    });

    if (!chat || !chat.isShared) {
      return res.status(404).json({ error: 'Shared chat not found' });
    }

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message to a shared chat
router.post('/shared/:sharedCode/message', async (req, res) => {
  try {
    const { sharedCode } = req.params;
    const { message, sourceLanguage, targetLanguage, style, tone } = req.body;

    const chat = await prisma.chat.findUnique({
      where: { sharedCode },
      include: { history: true },
    });

    if (!chat || !chat.isShared) {
      return res.status(404).json({ error: 'Shared chat not found' });
    }

    if (chat.sharePermission !== 'edit') {
      return res.status(403).json({ error: 'This chat is view-only' });
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        text: message,
      },
    });

    // Get AI response based on chat type
    let aiResponse;

    if (chat.type === 'translate' && sourceLanguage && targetLanguage) {
      // Import the translation function
      const { getTranslation } = await import('../lib/translateAI.js');
      aiResponse = await getTranslation(message, sourceLanguage, targetLanguage);
    } else if (chat.type === 'format' && style && tone) {
      // Import the formatting function
      const { ReformateText } = await import('../lib/ReformateTextAi.js');
      aiResponse = await ReformateText(message, style, tone);
    } else if (chat.type === 'file') {
      // For file chats - typically we'd need file handling logic
      // In shared context, process the text directly
      const { getFile } = await import('../lib/fileAI.js');
      aiResponse = await getFile(message, 'analyze');
    } else if (chat.type === 'custom') {
      // For custom chats
      const { getNewPrompt } = await import('../lib/newPromptAI.js');
      aiResponse = await getNewPrompt(message);
    } else {
      // Default chat type - general conversation
      const { getNewPrompt } = await import('../lib/newPromptAI.js');
      aiResponse = await getNewPrompt(message);
    }

    // Create AI message
    const modelMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'model',
        text: aiResponse,
      },
    });

    res.status(200).json({
      success: true,
      newMessages: [userMessage, modelMessage],
    });
  } catch (error) {
    console.error('Error in shared chat message:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
