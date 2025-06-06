import OpenAI from 'openai';
import { getUserModelConfig } from './modelConfig.js';

const reformateTextAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ReformateText(message, style, tone, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);

    const prompt = `Please rewrite the following text in a ${style} style and a ${tone} tone:\n\n"${message}"`;

    const completion = await reformateTextAi.chat.completions.create({
      ...config,
      messages: [{ role: 'user', content: prompt }],
    });

    console.log(`Text reformatted using model: ${config.model}`);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('error fetching completion(formating):', error);
    throw error;
  }
}
