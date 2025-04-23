import OpenAI from 'openai';
import mammoth from 'mammoth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getFile(file, action) {
  try {
    const systemPrompt = `You are a document analysis assistant.
    
    Format your responses using proper markdown:
    - Use headings (# ## ###) to organize your content
    - Use **bold** and *italic* for emphasis
    - Create lists with - or 1. when appropriate
    - Break your response into clear sections with headings`;

    const userPrompt = `Please ${action} the following document content:\n\n${file}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('File analysis generated with markdown formatting');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching completion(file):', error);
    throw error;
  }
}

export async function extractTextFromFile(filePath) {
  try {
    return await extractTextFromDocx(filePath);

  } catch (error) {
    console.error(`Error extracting text from file: ${error.message}`);
    throw error;
  }
}

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (e) {
    console.error('Error in extractTextFromDocx:', e);
    throw e;
  }
}



