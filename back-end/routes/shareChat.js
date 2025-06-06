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

    // Create a user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        text: message,
      },
    });

    // Get AI response based on a chat type
    let response;

    if (chat.type === 'translate' && sourceLanguage && targetLanguage) {
      const { getTranslation } = await import('../lib/translateAI.js');
      response = await getTranslation(message, sourceLanguage, targetLanguage);
    } else if (chat.type === 'format' && style && tone) {
      const { ReformateText } = await import('../lib/ReformateTextAi.js');
      response = await ReformateText(message, style, tone);
    } else if (chat.type === 'file') {
      const { getFile } = await import('../lib/fileAI.js');
      response = await getFile(message, 'analyze');
    } else if (chat.type === 'custom') {
      const { getNewPrompt } = await import('../lib/newPromptAI.js');
      response = await getNewPrompt(message);
    } else {
      const { getNewPrompt } = await import('../lib/newPromptAI.js');
      response = await getNewPrompt(message);
    }

    const aiContent = response.content || response;
    const metadata = response.metadata || null;

    const modelMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'model',
        text: aiContent,
        metadata: metadata,
      },
    });

    res.status(200).json({
      success: true,
      newMessages: [userMessage, modelMessage],
    });
  } catch (error) {
    console.error('error in shared chat message:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
