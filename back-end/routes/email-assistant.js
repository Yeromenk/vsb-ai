import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { generateEmailResponse } from '../lib/emailAI.js';

const router = express.Router();
const prisma = new PrismaClient();

// update a chat email response
router.put('/email/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { prompt } = req.body;
  const emailResponse = await generateEmailResponse(prompt, userId);

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
              text: prompt,
            },
            {
              role: 'model',
              text: emailResponse,
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
    console.error('error in email assistant:', error);
    res.status(500).json({ error: 'error generating email response' });
  }
});

// answer an email
router.post('/email', async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user?.id;

  try {
    const emailResponse = await generateEmailResponse(prompt, userId);
    res.status(200).json({ response: emailResponse });
  } catch (error) {
    console.error('error in email assistant:', error);
    res.status(500).json({ error: 'error generating email response' });
  }
});

export default router;
