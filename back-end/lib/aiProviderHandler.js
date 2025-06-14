import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handleAIRequest(config, provider, messages) {
  let content, tokensUsed;

  switch (provider) {
    case 'google':
      const geminiModel = googleAI.getGenerativeModel({ model: config.model });
      const geminiResult = await geminiModel.generateContent({
        contents: messages,
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.max_tokens,
          topK: config.topK,
          topP: config.topP,
        },
      });
      content = geminiResult.response.text();
      tokensUsed = geminiResult.response.usageMetadata?.totalTokenCount || 0;
      break;

    case 'openai':
    default:
      const completion = await openai.chat.completions.create({
        ...config,
        messages: messages,
      });
      content = completion.choices[0].message.content;
      tokensUsed = completion.usage.total_tokens;
      break;
  }

  return { content, tokensUsed };
}

export function formatProviderMessages(provider, userPrompt, systemPrompt = null) {
  switch (provider) {
    case 'google':
      // Google requires a different format
      return [
        {
          role: 'user',
          parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt }],
        },
      ];

    case 'openai':
    default:
      // OpenAI format
      if (systemPrompt) {
        return [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ];
      } else {
        return [{ role: 'user', content: userPrompt }];
      }
  }
}
