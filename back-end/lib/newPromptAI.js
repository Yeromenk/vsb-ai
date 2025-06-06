import OpenAI from 'openai';
import { getUserModelConfig } from './modelConfig.js';
import { createResponseWithMetadata } from './metadataHelper.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getNewPrompt(instructions, message, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);

    const systemPrompt = `${instructions || 'You are a helpful assistant.'}
    
    Format your responses using proper markdown:
    - Use headings (# ## ###) to organize your content
    - Use **bold** and *italic* for emphasis
    - Create lists with - or 1. when appropriate
    - Always wrap code in proper \`\`\`language ... \`\`\` blocks with the language specified
    - Use tables when presenting structured data
    - Use > for important notes or quotes
    - Break your response into clear sections with headings

    Keep your explanations clear and comprehensive.`;

    const prompt = message || 'Hello';

    const completion = await openai.chat.completions.create({
      ...config,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const content = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    console.log(`AI response generated using model: ${config.model}`);
    return createResponseWithMetadata(content, config.model, tokensUsed);
  } catch (error) {
    console.error('error generating prompt:', error);
    throw error;
  }
}
