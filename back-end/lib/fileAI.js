import OpenAI from 'openai';
import mammoth from 'mammoth';
import fs from 'fs-extra';
import readExcelFile from 'read-excel-file/node';
import path from 'path';
import { getUserModelConfig } from './modelConfig.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getFile(file, action, userId = null) {
  try {
    const config = await getUserModelConfig(userId, 1000);

    const systemPrompt = `You are a document analysis assistant.
    
    Format your responses using proper markdown:
    - Use headings (# ## ###) to organize your content
    - Use **bold** and *italic* for emphasis
    - Create lists with - or 1. when appropriate
    - Break your response into clear sections with headings`;

    const userPrompt = `Please ${action} the following document content:\n\n${file}`;

    const completion = await openai.chat.completions.create({
      ...config,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    console.log(`File analysis generated using model: ${config.model}`);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('error fetching completion(file):', error);
    throw error;
  }
}

export async function extractTextFromFile(filePath, originalFilename) {
  try {
    // Check if a file exists before processing
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Use originalFilename to get the extension
    const extension = path.extname(originalFilename || '').toLowerCase();

    switch (extension) {
      case '.docx':
        return await extractTextFromDocx(filePath);
      case '.pdf':
        return `[PDF file detected: ${originalFilename}. PDF content for analysis is not supported. Please convert to text or DOCX format.]`;
      case '.xlsx':
      case '.xls':
        return await extractTextFromExcel(filePath);
      case '.txt':
      case '.csv':
        return await extractTextFromTxt(filePath);
      // Handle common image formats
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.bmp':
        return `[This is an image file (${extension}). To analyze images, please use a dedicated image analysis function.]`;
      default:
        // Try to read as plain text for unknown extensions
        try {
          const data = await fs.readFile(filePath, 'utf8');
          if (data && data.trim().length > 0) return data;
          return `[Unknown file type (${extension || 'no extension'}). File content couldn't be processed as text.]`;
        } catch (e) {
          console.error(`Error reading file as text:`, e.message);
          return `[Error: Unable to read file content. The file may be binary or in an unsupported format.]`;
        }
    }
  } catch (error) {
    console.error(`Error extracting text from file: ${error.message}`);
    return `[Error extracting text: ${error.message}]`;
  }
}

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    if (!result.value || result.value.trim().length === 0) {
      return 'The DOCX file contains no extractable text.';
    }
    return result.value;
  } catch (e) {
    console.error('error in extractTextFromDocx:', e);
    return `[Error processing DOCX file: ${e.message}]`;
  }
}

async function extractTextFromExcel(filePath) {
  try {
    const rows = await readExcelFile(filePath);
    const textContent = rows.map(row => row.join('\t')).join('\n');
    if (!textContent || textContent.trim().length === 0) {
      return 'The Excel file contains no extractable text.';
    }
    return textContent;
  } catch (e) {
    console.error('error in extractTextFromExcel:', e);
    return `[Error processing Excel file: ${e.message}]`;
  }
}

async function extractTextFromTxt(filePath) {
  try {
    const textContent = await fs.readFile(filePath, 'utf8');
    if (!textContent || textContent.trim().length === 0) {
      return 'The text file is empty or contains no text.';
    }
    return textContent;
  } catch (e) {
    console.error('error in extractTextFromTxt:', e);
    return `[Error processing text file: ${e.message}]`;
  }
}
