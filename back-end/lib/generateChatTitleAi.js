import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatTitle(messageContent) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Create a concise, descriptive title (maximum 40 characters) for a chat based on the following user message. Return only the title, nothing else.',
        },
        { role: 'user', content: messageContent },
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    // Trim the response and ensure it's not longer than 40 chars
    let title = completion.choices[0].message.content.trim();
    title = title.replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
    return title.substring(0, 40);
  } catch (error) {
    console.error('error generating chat title:', error);
    // Fallback to original method if generation fails
    return messageContent.substring(0, 40);
  }
}
