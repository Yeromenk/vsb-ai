import OpenAI from 'openai';
import { getUserModelConfig } from './modelConfig.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmailResponse(prompt, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1500);

    const systemMessage = `You are an AI email assistant that drafts professional email responses based on the provided content.

GUIDELINES:
- Write only the email response.
- Avoid adding unnecessary sections like "Information Requested" or "Response".
- Use markdown formatting for clarity:
  - Include a subject line if relevant.
  - Use proper greeting and closing.
  - Structure the email with clear paragraphs.

EXAMPLE FORMAT:
Subject: [Insert Subject]

[Greeting],

[Body of the email]

[Closing],
[Your Name]`;

    const userMessage = `Draft a response email based on the following content:

"${prompt}"`;

    const completion = await openai.chat.completions.create({
      ...config,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
    });

    console.log(`Email response generated using model: ${config.model}`);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating email response:', error);
    throw error;
  }
}
