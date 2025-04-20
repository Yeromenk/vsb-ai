import OpenAI from 'openai';
import mammoth from 'mammoth';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getFile(file, action) {
  try {
    const prompt = `Please ${action} the following file:\n\n"${file}". Write only the ${action}, without the quotation marks. Write in language that is easy to understand.`;

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
    return completion.choices[0].message.content.split('\n').map(line => {
      return line.trim();
    });
  } catch (error) {
    console.error('Error fetching completion(file):', error);
    throw error; // Re-throw to properly handle the error
  }
}

export async function extractTextFromFile(filePath) {
  try {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.docx':
        return await extractTextFromDocx(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
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



