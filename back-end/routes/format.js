import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { ReformateText } from '../lib/ReformateTextAi.js';

const prisma = new PrismaClient();
const router = express.Router();

// update a chat format
router.put('/format/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message, style, tone } = req.body;

  try {
    const response = await ReformateText(message, style, tone, userId);

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

    // Extract content and metadata
    const formattedContent = response.content || response;
    const metadata = response.metadata || null;

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
              text: formattedContent,
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

// get a chat format
router.post('/format', async (req, res) => {
  const { message, style, tone } = req.body;
  const userId = req.user?.id;

  try {
    const completion = await ReformateText(message, style, tone, userId);
    res.status(200).json({ response: completion });
  } catch (error) {
    console.error('error in /format:', error);
    res.status(500).json({ error: 'Internal Server error' });
  }
});

export default router;
