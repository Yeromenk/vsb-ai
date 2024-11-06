import express from 'express';

const router = express.Router();
import {PrismaClient} from '@prisma/client';
import verifyToken from "../controllers/auth.js";
import {getTranslation} from "../lib/translateAI.js";

const prisma = new PrismaClient();

router.post('/chats', async (req, res) => {
    const {message, userId} = req.body;

    try {
        const newChat = await prisma.chat.create({
            data: {
                userId: userId,
                title: message.substring(0, 40),
                history: {
                    create: [
                        {
                            role: 'user',
                            text: message,
                        },
                    ],
                },
            },
            include: {
                history: true,
            },
        });

        let userChats = await prisma.userChats.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!userChats) {
            await prisma.userChats.create({
                data: {
                    userId: userId,
                    chats: {
                        connect: {
                            id: newChat.id,
                        },
                    },
                },
            });
        } else {
            await prisma.userChats.update({
                where: {
                    id: userChats.id,
                },
                data: {
                    chats: {
                        connect: {
                            id: newChat.id,
                        },
                    },
                },
            });
        }

        res.status(201).send({response: newChat});
    } catch (error) {
        console.error("Error in /translate:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});


router.get('/userChats', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const userChats = await prisma.userChats.findFirst({
            where: {
                userId: userId,
            },
            include: {
                chats: true,
            },
        });

        if (!userChats) {
            return res.status(404).json({error: 'User chats not found'});
        }

        res.status(200).json({response: userChats.chats});
    } catch (error) {
        console.error("Error in /userChats:", error);
        res.status(500).json({error: "Error in fetching /userChats"});
    }
})

router.get('/chat/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const chatId = req.params.id

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                userId: userId,
            },
            include: {
                history: true,
            },
        });

        if (!chat) {
            return res.status(404).json({error: 'User chats not found'});
        }

        res.status(200).json({response: chat});
    } catch (error) {
        console.error("Error in chats:", error);
        res.status(500).json({error: "Error in fetching chats"});
    }
})


router.put('/chat/:id', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const chatId = req.params.id
    const {message, sourceLanguage, targetLanguage} = req.body;
    const translatedText = await getTranslation(message, sourceLanguage, targetLanguage);

    try {
        const updatedChat = await prisma.chat.update({
            where: {
                id: chatId,
                userId: userId,
            },
            data: {
                history: {
                    create: [
                        {
                            role: 'user',
                            text: message,
                        },
                        {
                            role: 'model',
                            text: translatedText,
                        },
                    ],
                },
            },
            include: {
                history: true,
            },
        });

        res.status(200).json({response: updatedChat});
    } catch (error) {
        console.error("Error in chats:", error);
        res.status(500).json({error: "Error adding chat"});
    }
})

router.post('/translate', async (req, res) => {
    const {message, sourceLanguage, targetLanguage} = req.body;
    try {
        const translatedText = await getTranslation(message, sourceLanguage, targetLanguage);
        res.status(200).json({translatedText});
    } catch (error) {
        console.error("Error in /translate:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

export default router;
