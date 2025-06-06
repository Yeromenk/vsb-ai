import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { getTranslation } from '../lib/translateAI.js';

const router = express.Router();
const prisma = new PrismaClient();

// Update a chat translation
router.put('/translate/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message, sourceLanguage, targetLanguage } = req.body;
  const translatedText = await getTranslation(message, sourceLanguage, targetLanguage, userId);

  try {
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
              text: translatedText,
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
    const translatedText = await getTranslation(message, sourceLanguage, targetLanguage, userId);
    res.status(200).json({ translatedText });
  } catch (error) {
    console.error('error in /translate:', error);
    res.status(500).json({ error: 'Internal Server error' });
  }
});

export default router;
