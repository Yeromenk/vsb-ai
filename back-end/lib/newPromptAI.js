import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getNewPrompt(instructions, message) {
  try {
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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('AI response generated with markdown formatting');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}
