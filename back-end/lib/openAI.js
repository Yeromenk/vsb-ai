import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCompletion(message, style, tone) {
  try {
    const prompt = `Please rewrite the following text in a ${style} style and a ${tone} tone:\n\n"${message}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('Completion response:', completion);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching completion(formating):', error);
  }
}
