import express from 'express';
import verifyToken from '../controllers/auth.js';
import { searchChatsByEmbeddings } from '../lib/embeddingAi.js';

const router = express.Router();

router.get('/semantic-search', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query parameter is required' });
  }

  try {
    const results = await searchChatsByEmbeddings(userId, query);
    res.status(200).json({ response: results });
  } catch (error) {
    console.error('error in semantic search:', error);
    res.status(500).json({ error: 'error searching chats' });
  }
});

export default router;
