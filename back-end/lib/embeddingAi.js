import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbeddings(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('error generating embeddings:', error);
    throw error;
  }
}

export async function updateChatEmbeddings(chatId) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { history: true },
    });

    if (!chat) return null;

    // Ensure there's content to generate embeddings from
    let content = chat.title || 'Untitled Chat';

    if (chat.history && chat.history.length > 0) {
      const messageTexts = chat.history
        .filter(msg => msg.text && msg.text.trim() !== '')
        .map(msg => msg.text);

      if (messageTexts.length > 0) {
        content = [content, ...messageTexts].join(' ');
      }
    }

    // Truncate if needed
    content = content.substring(0, 8000);

    // Generate embeddings
    const embeddings = await generateEmbeddings(content);

    return await prisma.chat.update({
      where: { id: chatId },
      data: { embeddings },
    });
  } catch (error) {
    console.error('error updating chat embeddings:', error);
    throw error;
  }
}

export async function searchChatsByEmbeddings(userId, query) {
  try {
    // Generate embeddings for the search query
    const queryEmbeddings = await generateEmbeddings(query);

    // Get all user's chats with non-empty embeddings
    const userChats = await prisma.chat.findMany({
      where: {
        userId,
        embeddings: {
          isEmpty: false,
        },
      },
      include: { history: true },
    });

    // Calculate similarity scores and find matching messages
    const results = userChats.map(chat => {
      const similarity = calculateCosineSimilarity(queryEmbeddings, chat.embeddings);

      // Find messages containing the search query (case-insensitive)
      const matchingMessages = chat.history.filter(msg =>
        msg.text.toLowerCase().includes(query.toLowerCase())
      );

      // Create context excerpts from matching messages
      const excerpts = matchingMessages
        .map(msg => {
          const text = msg.text;
          const queryLower = query.toLowerCase();
          const textLower = text.toLowerCase();
          const index = textLower.indexOf(queryLower);

          if (index === -1) return null;

          // Start excerpt at the match position instead of showing text before it
          const start = index;
          const end = Math.min(text.length, index + 150); // Show more content after the match
          let excerpt = text.substring(start, end);

          // Only add ellipsis at the end if needed
          if (end < text.length) excerpt = excerpt + '...';

          return {
            messageId: msg.id,
            role: msg.role,
            excerpt,
          };
        })
        .filter(Boolean);

      return {
        chat,
        similarity,
        excerpts,
      };
    });

    // Use dynamic threshold based on query length
    const wordCount = query.trim().split(/\s+/).length;
    let threshold = wordCount === 1 ? 0.1 : 0.3;

    // Filter results that meet threshold OR have direct text matches
    let filteredResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .filter(item => item.similarity > threshold || item.excerpts.length > 0);

    // Return chat and excerpt information
    return filteredResults.map(item => ({
      ...item.chat,
      matchExcerpts: item.excerpts,
    }));
  } catch (error) {
    console.error('error searching chats by embeddings:', error);
    throw error;
  }
}

// Calculate cosine similarity between two embedding vectors
function calculateCosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  return dotProduct / (normA * normB);
}
