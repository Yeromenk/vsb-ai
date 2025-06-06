import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { getTranslation } from '../lib/translateAI.js';

const router = express.Router();
const prisma = new PrismaClient();

// Update a chat translation
// Fix for back-end/routes/translate.js
router.put('/translate/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message, sourceLanguage, targetLanguage } = req.body;

  try {
    const response = await getTranslation(message, sourceLanguage, targetLanguage, userId);

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId,
      },
    });

    if (!chat) {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to modify this chat',
        unauthorized: true,
      });
    }

    const translatedContent = response.content;
    const metadata = response.metadata;

    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        title: chat.title,
        history: {
          create: [
            {
              role: 'user',
              text: message,
            },
            {
              role: 'model',
              text: translatedContent,
              metadata: metadata,
            },
          ],
        },
      },
      include: {
        history: true,
      },
    });

    res.status(200).json({ response: updatedChat });
  } catch (error) {
    console.error('error in chats:', error);
    res.status(500).json({ error: 'error adding chat' });
  }
});

// translate a message
router.post('/translate', async (req, res) => {
  const { message, sourceLanguage, targetLanguage } = req.body;
  const userId = req.user?.id;

  try {
    const response = await getTranslation(message, sourceLanguage, targetLanguage, userId);
    res.status(200).json({ response });
  } catch (error) {
    console.error('error in /translate:', error);
    res.status(500).json({ error: 'Internal Server error' });
  }
});

export default router;
