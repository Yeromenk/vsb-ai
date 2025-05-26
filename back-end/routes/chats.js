import express from 'express';
import multer from 'multer';
import { updateChatEmbeddings } from '../lib/embeddingAi.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { getTranslation } from '../lib/translateAI.js';
import { ReformateText } from '../lib/ReformateTextAi.js';
import { extractTextFromFile, getFile } from '../lib/fileAI.js';
import { getNewPrompt } from '../lib/newPromptAI.js';
import { generateChatTitle } from '../lib/generateChatTitleAi.js';

const prisma = new PrismaClient();

// Create a new chat
router.post('/chats', upload.single('file'), async (req, res) => {
  const {
    message,
    userId,
    sourceLanguage,
    targetLanguage,
    style,
    tone,
    action,
    name,
    description,
    instructions,
  } = req.body;
  const file = req.file;

  let responseText;
  let chatType;
  let chatTitle;

  if (message) {
    chatTitle = await generateChatTitle(message);
  } else if (file) {
    chatTitle = file.originalname;
  } else {
    chatTitle = 'New Chat';
  }

  if (sourceLanguage && targetLanguage) {
    responseText = await getTranslation(message, sourceLanguage, targetLanguage, userId);
    chatType = 'translate';
  } else if (style && tone) {
    responseText = await ReformateText(message, style, tone, userId);
    chatType = 'format';
  } else if (file && action) {
    try {
      const extractedText = await extractTextFromFile(file.path, file.originalname);

      // Check if the response starts with [Error or [PDF file detected
      if (extractedText.startsWith('[Error') || extractedText.startsWith('[PDF file')) {
        return res.status(400).json({ error: extractedText });
      }

      responseText = await getFile(extractedText, action, userId);
      chatType = 'file';
    } catch (error) {
      return res.status(500).json({ error: `Error processing the file: ${error.message}` });
    }
  } else if (name && description && instructions) {
    responseText = await getNewPrompt(instructions, userId);
    chatType = 'custom';
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const newChat = await prisma.chat.create({
      data: {
        userId: userId,
        title: chatTitle,
        type: chatType,
        history: {
          create: [
            {
              role: 'user',
              text: message || file.originalname,
            },
            {
              role: 'model',
              text: Array.isArray(responseText) ? responseText.join(' ') : responseText,
            },
          ],
        },
        files: file
          ? {
              create: {
                fileName: file.originalname,
                filePath: file.path,
                fileType: file.mimetype,
              },
            }
          : undefined,
      },
      include: {
        history: true,
        files: true,
      },
    });

    await updateChatEmbeddings(newChat.id);

    let userChats = await prisma.userChats.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!userChats) {
      await prisma.userChats.create({
        data: {
          userId: userId,
          chats: {
            connect: {
              id: newChat.id,
            },
          },
        },
      });
    } else {
      await prisma.userChats.update({
        where: {
          id: userChats.id,
        },
        data: {
          chats: {
            connect: {
              id: newChat.id,
            },
          },
        },
      });
    }

    res.status(201).send({ response: newChat });
  } catch (error) {
    console.error('Error in /chats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all user chats
router.get('/userChats', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const userChats = await prisma.userChats.findFirst({
      where: {
        userId: userId,
      },
      include: {
        chats: true,
      },
    });

    if (!userChats) {
      return res.status(200).json({ response: [] });
    }

    res.status(200).json({ response: userChats.chats });
  } catch (error) {
    console.error('Error in /userChats:', error);
    res.status(500).json({ error: 'Error in fetching /userChats' });
  }
});

// Get a specific chat
router.get('/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId,
      },
      include: {
        history: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        files: true,
      },
    });

    if (!chat) {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to view this chat',
        unauthorized: true,
      });
    }

    res.status(200).json({ response: chat });
  } catch (error) {
    console.error('Error in chats:', error);
    res.status(500).json({ error: 'Error in fetching chats' });
  }
});

// update a chat title
router.put('/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { title } = req.body;

  try {
    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
        title: title,
      },
    });

    res.status(200).json({ response: updatedChat });
  } catch (error) {
    console.error('Error in chats:', error);
    res.status(500).json({ error: 'Error adding chat' });
  }
});

// delete a chat
router.delete('/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId,
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or not authorized' });
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      // Delete a chat-message first
      prisma.message.deleteMany({
        where: { chatId: chatId },
      }),
      // Delete files next
      prisma.file.deleteMany({
        where: { chatId: chatId },
      }),
      // Delete chat last
      prisma.chat.delete({
        where: { id: chatId },
      }),
    ]);

    res.status(200).json({ response: 'Chat deleted' });
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// delete all chats
router.delete('/delete-all-chats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // First get all the user's chat IDs
    const userChats = await prisma.chat.findMany({
      where: { userId },
      select: { id: true },
    });

    const chatIds = userChats.map(chat => chat.id);

    // Use a transaction to delete all related records in the correct order
    await prisma.$transaction([
      // First, delete all messages associated with these chats
      prisma.message.deleteMany({
        where: { chatId: { in: chatIds } },
      }),
      // Then delete any files associated with these chats
      prisma.file.deleteMany({
        where: { chatId: { in: chatIds } },
      }),
      // Finally, delete the chats themselves
      prisma.chat.deleteMany({
        where: { userId },
      }),
    ]);

    res.status(200).json({ message: 'All chats deleted successfully' });
  } catch (error) {
    console.error('Error deleting chats:', error);
    res.status(500).json({ error: 'Failed to delete chats' });
  }
});

export default router;
