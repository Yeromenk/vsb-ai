import OpenAI from 'openai';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import xlsx from 'xlsx';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getFile(file, action) {
  try {
    const systemPrompt = `You are a document analysis assistant. Write ${action} in language that the document is written in.
    
    Format your responses using proper markdown:
    - Use headings (# ## ###) to organize your content
    - Use **bold** and *italic* for emphasis
    - Create lists with - or 1. when appropriate
    - Break your response into clear sections with headings`;

    const userPrompt = `Please ${action} the following document content:\n\n${file}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
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
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    const extension = path.extname(filePath).toLowerCase();
    console.log(`Processing file with extension: ${extension}`);

    switch (extension) {
      case '.docx':
        return await extractTextFromDocx(filePath);
      case '.pdf':
        return await extractTextFromPdf(filePath);
      case '.txt':
      case '.md':
      case '.json':
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
      case '.html':
      case '.css':
      case '.xml':
      case '.yml':
      case '.yaml':
        return await extractTextFromTxt(filePath);
      case '.xlsx':
      case '.xls':
        return await extractTextFromExcel(filePath);
      case '.csv':
        return await extractTextFromCsv(filePath);
      case '.rtf':
        return await extractTextFromRtf(filePath);
      default:
        // Try to process as text for unknown types
        try {
          return await extractTextFromTxt(filePath);
        } catch (txtError) {
          console.log('Failed to extract as text, trying binary');
          // Last resort - if text extraction fails, return a placeholder
          return `[File content could not be extracted. File type "${extension}" may not be supported for text extraction]`;
        }
    }
  } catch (error) {
    console.error(`Error extracting text from file: ${error.message}`);
    return `[Error extracting text: ${error.message}]`;
  }
}

async function extractTextFromPdf(filePath) {
  try {
    // First, try with pdf-lib to check if a file is valid
    const pdfBytes = await fs.readFile(filePath);

    try {
      // Validate PDF structure
      await PDFDocument.load(pdfBytes);

      // If we got here, PDF is valid
      const pdfExtract = require('pdf-extract');

      return new Promise((resolve, reject) => {
        const processor = pdfExtract(filePath, { type: 'text' }, function (err) {
          if (err) reject(err);
        });

        let text = '';
        processor.on('page', page => {
          text += page.text + '\n';
        });

        processor.on('complete', data => {
          resolve(text || data.text_pages.join('\n'));
        });

        processor.on('error', reject);
      });
    } catch (pdfError) {
      // Fallback to simple text extraction if the PDF structure is invalid
      return `[PDF content extraction failed: ${pdfError.message}]`;
    }
  } catch (e) {
    console.error('Error in extractTextFromPdf:', e);
    return '[PDF content could not be extracted]';
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

async function extractTextFromTxt(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (e) {
    console.error('Error in extractTextFromTxt:', e);
    throw e;
  }
}

async function extractTextFromExcel(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    let result = '';

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetText = xlsx.utils.sheet_to_txt(worksheet, { header: 1 });
      result += `Sheet: ${sheetName}\n${sheetText}\n\n`;
    });

    return result;
  } catch (e) {
    console.error('Error in extractTextFromExcel:', e);
    throw e;
  }
}

async function extractTextFromCsv(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (e) {
    console.error('Error in extractTextFromCsv:', e);
    throw e;
  }
}

async function extractTextFromRtf(filePath) {
  try {
    // Basic RTF extraction
    const text = await fs.readFile(filePath, 'utf8');
    return text.replace(/\{[^{}]+}|\\\w+|\\;|\\\\|\\'[0-9a-f]{2}|[{}\\]/g, '');
  } catch (e) {
    console.error('Error in extractTextFromRtf:', e);
    throw e;
  }
}
