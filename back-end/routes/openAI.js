import express from 'express';

const router = express.Router();

import {getCompletion} from "../lib/openAI.js";
import {getTranslation} from "../lib/translateAI.js";

router.post('/format', async (req, res) => {
    const {message, style, tone} = req.body;
    try {
        const response = await getCompletion(message, style, tone);
        res.json({response});
    } catch (error) {
        console.error("Error in handleSend:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.post('/translate', async (req, res) => {
    const {message, sourceLanguage, targetLanguage} = req.body;
    try {
        const response = await getTranslation(message, sourceLanguage, targetLanguage);
        res.json({response});
    } catch (error) {
        console.error("Error in handleSend:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

export default router;