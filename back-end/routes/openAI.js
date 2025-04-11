import express from 'express';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { getTranslation } from '../lib/translateAI.js';
import { getCompletion } from '../lib/openAI.js';
import { extractTextFromDocx, getFile } from '../lib/fileAI.js';
import { getNewPrompt } from '../lib/newPromptAI.js';

const prisma = new PrismaClient();

// TODO: исправить ошибки (если есть) / улучшить код / сократить его

// 1. Create a custom chat template
router.post('/chats/custom-template', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, description, instructions } = req.body;

  try {
    const newCustomTemplate = await prisma.chat.create({
      data: {
        userId: userId,
        title: name,
        type: 'custom_template',
        description: description,
        instructions: instructions,
      },
      include: {
        history: true,
      },
    });

    // Connect to userChats
    let userChats = await prisma.userChats.findFirst({
      where: { userId: userId },
    });

    if (!userChats) {
      await prisma.userChats.create({
        data: {
          userId: userId,
          chats: { connect: { id: newCustomTemplate.id } },
        },
      });
    } else {
      await prisma.userChats.update({
        where: { id: userChats.id },
        data: { chats: { connect: { id: newCustomTemplate.id } } },
      });
    }

    res.status(201).json({ response: newCustomTemplate });
  } catch (error) {
    console.error('Error creating custom template:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Create a conversation from a custom template
router.post('/chats/custom-conversation', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { templateId, message } = req.body;

  try {
    // Get template details
    const template = await prisma.chat.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get AI response based on template instructions and user message
    const aiResponse = await getNewPrompt(template.instructions, message);

    // Create a new conversation chat
    const newConversation = await prisma.chat.create({
      data: {
        userId: userId,
        title: `${template.title} Conversation`,
        type: 'custom_conversation',
        description: template.description,
        instructions: template.instructions,
        history: {
          create: [
            {
              role: 'user',
              text: message,
            },
            {
              role: 'model',
              text: aiResponse,
            },
          ],
        },
      },
      include: {
        history: true,
      },
    });

    // Connect to userChats
    let userChats = await prisma.userChats.findFirst({
      where: { userId: userId },
    });

    if (!userChats) {
      await prisma.userChats.create({
        data: {
          userId: userId,
          chats: { connect: { id: newConversation.id } },
        },
      });
    } else {
      await prisma.userChats.update({
        where: { id: userChats.id },
        data: { chats: { connect: { id: newConversation.id } } },
      });
    }

    res.status(201).json({ response: newConversation });
  } catch (error) {
    console.error('Error creating custom conversation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Update a custom conversation with new messages
router.put('/chats/custom-conversation/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message } = req.body;

  try {
    // Get chat to ensure it exists and belongs to user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { history: true },
    });

    if (!chat || chat.userId !== userId) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Generate AI response based on the chat instructions and new message
    const aiResponse = await getNewPrompt(chat.instructions, message);

    // Add new messages to the chat
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        history: {
          create: [
            {
              role: 'user',
              text: message,
            },
            {
              role: 'model',
              text: aiResponse,
            },
          ],
        },
      },
      include: { history: true },
    });

    // Get updated chat
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { history: true },
    });

    res.status(200).json({ response: updatedChat });
  } catch (error) {
    console.error('Error updating custom conversation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

  if (sourceLanguage && targetLanguage) {
    responseText = await getTranslation(message, sourceLanguage, targetLanguage);
    chatType = 'translate';
  } else if (style && tone) {
    responseText = await getCompletion(message, style, tone);
    chatType = 'format';
  } else if (file && action) {
    try {
      const extractedText = await extractTextFromDocx(file.path);

      if (!extractedText || extractedText.length === 0) {
        return res.status(400).json({ error: 'File is empty or contains unreadable text' });
      }

      responseText = await getFile(extractedText, action);
      chatType = 'file';
    } catch (error) {
      return res.status(500).json({ error: 'Error processing the file' });
    }
  } else if (name && description && instructions) {
    responseText = await getNewPrompt(instructions);
    chatType = 'custom';
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const newChat = await prisma.chat.create({
      data: {
        userId: userId,
        title: message ? message.substring(0, 40) : file.originalname,
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
      return res.status(404).json({ error: 'User chats not found' });
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
        history: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'User chats not found' });
    }

    res.status(200).json({ response: chat });
  } catch (error) {
    console.error('Error in chats:', error);
    res.status(500).json({ error: 'Error in fetching chats' });
  }
});

// update a chat format
router.put('/format/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message, style, tone } = req.body;
  const formattedText = await getCompletion(message, style, tone);

  try {
    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
        history: {
          create: [
            {
              role: 'user',
              text: message,
            },
            {
              role: 'model',
              text: formattedText,
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

// Update a chat translate
router.put('/translate/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message, sourceLanguage, targetLanguage } = req.body;
  const translatedText = await getTranslation(message, sourceLanguage, targetLanguage);

  try {
    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
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
    console.error('Error in chats:', error);
    res.status(500).json({ error: 'Error adding chat' });
  }
});

// Update a chat file
router.put('/file/chat/:id', verifyToken, upload.single('file'), async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { action } = req.body;
  const file = req.file;

  // const fileAction = await getFile(file, action);

  if (!file || !action) {
    return res.status(400).json({ error: 'File and action are required' });
  }

  try {
    const extractedText = await extractTextFromDocx(file.path);

    if (!extractedText || extractedText.length === 0) {
      return res.status(400).json({ error: 'File is empty or contains unreadable text' });
    }

    const modelResponse = await getFile(extractedText, action);

    if (!modelResponse || modelResponse.length === 0) {
      return res.status(400).json({ error: 'Model response is empty' });
    }

    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
        history: {
          create: [
            {
              role: 'user',
              text: `File: ${file.originalname}, Action: ${action}`,
            },
            {
              role: 'model',
              text: modelResponse.join('\n'),
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

// update a chat prompt
router.put('/prompt/chat/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message } = req.body;

  try {
    const chat = await prisma.chat.findFirst({
      // Changed from Chat to chat
      where: {
        id: chatId,
        userId: userId,
      },
      select: {
        instructions: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const aiResponse = await getNewPrompt(chat.instructions, message); // Changed from Chat to chat

    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
        history: {
          create: [
            {
              role: 'user',
              text: message,
            },
            {
              role: 'model',
              text: aiResponse,
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
      // Delete chat-message first
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

router.post('/translate', async (req, res) => {
  const { message, sourceLanguage, targetLanguage } = req.body;
  try {
    const translatedText = await getTranslation(message, sourceLanguage, targetLanguage);
    res.status(200).json({ translatedText });
  } catch (error) {
    console.error('Error in /translate:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/format', async (req, res) => {
  const { message, style, tone } = req.body;
  try {
    const completion = await getCompletion(message, style, tone);
    res.status(200).json({ response: completion });
  } catch (error) {
    console.error('Error in /format:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/file', async (req, res) => {
  const { file, action } = req.body;
  try {
    const fileAction = await getFile(file, action);
    res.status(200).json({ response: fileAction });
  } catch (error) {
    console.error('Error in /file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/custom', async (req, res) => {
  const { message } = req.body;
  try {
    const custom = await getNewPrompt(message);
    res.status(200).json({ response: custom });
  } catch (error) {
    console.error('Error in /custom:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
