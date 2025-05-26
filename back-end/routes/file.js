import verifyToken from '../controllers/auth.js';
import { extractTextFromFile, getFile } from '../lib/fileAI.js';
import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const upload = multer({ dest: 'uploads/' });
const prisma = new PrismaClient();
const router = express.Router();

// update a chat file
router.put('/file/chat/:id', verifyToken, upload.single('file'), async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { action } = req.body;
  const file = req.file;

  if (!file || !action) {
    return res.status(400).json({ error: 'File and action are required' });
  }

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

    const extractedText = await extractTextFromFile(file.path, file.originalname);

    // Check if the response starts with [Error or [PDF file detected
    if (extractedText.startsWith('[Error') || extractedText.startsWith('[PDF file')) {
      return res.status(400).json({ error: extractedText });
    }

    if (!extractedText || extractedText.length === 0) {
      return res.status(400).json({ error: 'File is empty or contains unreadable text' });
    }

    const modelResponse = await getFile(extractedText, action, userId);

    if (!modelResponse || modelResponse.length === 0) {
      return res.status(400).json({ error: 'Model response is empty' });
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
              text: `File: ${file.originalname}, Action: ${action}`,
            },
            {
              role: 'model',
              text: modelResponse,
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
    console.error('Error in chats:', error);
    res.status(500).json({ error: 'Error adding chat' });
  }
});

// upload a file
router.post('/file', async (req, res) => {
  const { file, action } = req.body;
  const userId = req.user?.id;

  try {
    const fileAction = await getFile(file, action, userId);
    res.status(200).json({ response: fileAction });
  } catch (error) {
    console.error('Error in /file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
