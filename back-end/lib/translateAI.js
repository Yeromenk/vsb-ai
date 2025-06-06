import OpenAI from 'openai';
import { getUserModelConfig } from './modelConfig.js';
import { createResponseWithMetadata } from './metadataHelper.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTranslation(message, sourceLanguage, targetLanguage, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);

    const prompt = `Please translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n"${message}". Write only the translation, without the quotation marks`;

    const completion = await openai.chat.completions.create({
      ...config,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    console.log(`Translation generated using model: ${config.model}`);
    return createResponseWithMetadata(content, config.model, tokensUsed);
  } catch (error) {
    console.error('error fetching completion(translate):', error);
    throw error;
  }
}
