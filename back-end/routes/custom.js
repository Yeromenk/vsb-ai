import express from 'express';
import { PrismaClient } from '@prisma/client';
import verifyToken from '../controllers/auth.js';
import { getNewPrompt } from '../lib/newPromptAI.js';

const prisma = new PrismaClient();
const router = express.Router();

// Create a custom chat template
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

// Create a conversation from a custom template
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
        title: message.substring(0, 40),
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

// Update a custom conversation with new messages
router.put('/chats/custom-conversation/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.id;
  const { message } = req.body;

  try {
    // Get chat to ensure it exists and belongs to a user
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

// post a custom chat
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

// Get all custom templates
router.get('/template/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const templateId = req.params.id;

  try {
    const template = await prisma.chat.findFirst({
      where: {
        id: templateId,
        userId: userId,
        type: 'custom_template'
      }
    });

    if (!template) {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to view this template',
        unauthorized: true
      });
    }

    res.status(200).json({ response: template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(403).json({
      message: 'Failed to access template',
      unauthorized: true
    });
  }
});

export default router