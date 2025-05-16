import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// edit a message in a chat
router.put('/edit-message/:chatId/:messageId', verifyToken, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // Find the chat and verify ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this message' });
    }

    // Find and update the message
    const message = await prisma.message.findUnique({
      where: {
        id: parseInt(messageId),
      },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Update the message
    await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { text: text },
    });

    res.status(200).json({ message: 'Message updated successfully' });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      message: 'Failed to update message',
      error: error.message,
    });
  }
});

export default router;
