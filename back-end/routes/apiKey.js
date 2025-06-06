import express from 'express';
import verifyToken from '../controllers/auth.js';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const router = express.Router();
const prisma = new PrismaClient();

// save API Key
router.post('/api-key', verifyToken, async (req, res) => {
  try {
    const { apiKey } = req.body;
    const userId = req.user.id;

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({ message: 'Invalid API Key format' });
    }

    // checking if apiKey is valid by making a request to OpenAI API
    try {
      const openai = new OpenAI({ apiKey });
      // make a simple request to validate the API key
      await openai.models.list();
    } catch (openaiError) {
      console.error('OpenAI API Key validation error:', openaiError);
      return res
        .status(400)
        .json({ message: 'Invalid API Key. Please check your key and try again.' });
    }

    // save the API key to the user's record
    await prisma.user.update({
      where: { id: userId },
      data: { apiKey },
    });

    res.status(200).json({ message: 'API Key saved successfully' });
  } catch (error) {
    console.error('error saving API Key:', error);
    res.status(500).json({ message: 'An error occurred while saving the API Key' });
  }
});

// check API Key
router.get('/check-api-key', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { apiKey: true },
    });

    const hasApiKey = !!(user && user.apiKey);

    res.status(200).json({ hasApiKey });
  } catch (error) {
    console.error('error checking API Key:', error);
    res.status(500).json({
      message: 'An error occurred while checking the API Key',
      hasApiKey: false,
    });
  }
});

export default router;
