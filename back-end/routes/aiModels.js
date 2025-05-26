import express from 'express';
import { availableModels } from '../lib/aiConfig.js';
import verifyToken from '../controllers/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// get models
router.get('/models', async (req, res) => {
  try {
    res.status(200).json({ models: availableModels });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching models' });
  }
});

// save user preferences
router.post('/models/preferences', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { modelId, temperature, maxTokens } = req.body;

  try {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        modelId,
        temperature,
        maxTokens,
      },
      create: {
        userId,
        modelId,
        temperature,
        maxTokens,
      },
    });

    res.status(200).json({ preferences });
  } catch (error) {
    res.status(500).json({ error: 'Error saving preferences' });
  }
});

// Get user preferences
router.get('/models/preferences', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    res.status(200).json({ preferences });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching preferences' });
  }
});

export default router;
