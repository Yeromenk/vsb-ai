import { PrismaClient } from '@prisma/client';
import { createModelConfig } from './aiConfig.js';

const prisma = new PrismaClient();

export async function getUserModelConfig(userId, defaultMaxTokens = 1000) {
  let modelConfig = {};

  if (userId) {
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (userPreferences) {
      modelConfig = {
        model: userPreferences.modelId,
        temperature: userPreferences.temperature,
        maxTokens: Math.min(userPreferences.maxTokens, defaultMaxTokens),
      };
    }
  }

  return createModelConfig(modelConfig.model, modelConfig.temperature, modelConfig.maxTokens);
}
