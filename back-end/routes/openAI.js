import express from 'express';

const router = express.Router();
import {PrismaClient} from '@prisma/client';
import verifyToken from "../controllers/auth.js";
import {getCompletion} from "../lib/openAI.js";
import {getTranslation} from "../lib/translateAI.js";
import {parse} from "dotenv";

const prisma = new PrismaClient();

router.post('/format', async (req, res) => {
    const {message, style, tone, userId} = req.body;
    try {
        // Создаем новый чат
        const newChat = await prisma.chat.create({
            data: {
                userId: userId,
                title: message.substring(0, 20),
                history: {
                    create: [
                        {
                            role: 'user',
                            text: message,
                        },
                    ]
                }
            },
            include: {
                history: true,
            }
        });

        // Находим или создаем userChats
        let userChats = await prisma.userChats.findUnique({
            where: {
                userId: userId,
            }
        });

        if (!userChats) {
            // Если userChats не существует, создаем новую запись
            await prisma.userChats.create({
                data: {
                    userId: userId,
                    chats: {
                        connect: {id: newChat.id}
                    }
                }
            });
        } else {
            // Обновляем userChats, добавляя новый чат
            await prisma.userChats.update({
                where: {
                    userId: userId,
                },
                data: {
                    chats: {
                        connect: {id: newChat.id}
                    }
                }
            });
        }

        // Отправляем JSON-ответ с ID нового чата
        res.status(201).json({response: newChat.id});

    } catch (error) {
        console.error("Error in handleSend:", error);
        res.status(500).json({error: "Internal Server Error"});
    }

    /*
    const {message, style, tone} = req.body;
    try {
        const response = await getCompletion(message, style, tone);
        res.json({response});
    } catch (error) {
        console.error("Error in handleSend:", error);
        res.status(500).json({error: "Internal Server Error"});
    }

     */
});

router.post('/translate', async (req, res) => {
    const {message, sourceLanguage, targetLanguage, userId} = req.body;
    try {
        const newChat = await prisma.chat.create({
            data: {
                userId: userId,
                title: message.substring(0, 40), // Set the title to the first 40 characters of the message
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

        // Check if the userChats exists
        // let userChats = await prisma.userChats.findFirst({
        //     where: {
        //         userId: userId,
        //     },
        // });

        let userChats = await prisma.userChats.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!userChats) {
            // If it doesn't exist, create a new one and add the chat in the chats array
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
            // If exists, push the chat to the existing array
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

        // Отправляем успешный ответ
        res.status(201).send({response: newChat});
        // res.status(201).json({ response: "Translation saved successfully" });
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

    if(!chatId) {
        console.error("Invalid chat ID", chatId);
        return res.status(400).json({error: "Invalid chat ID"});
    }

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId, // problem here!!!
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
    const userId = req.user.userId;
    const chatId = req.params.id;
    const {question, answer} = req.body;

    try {
        const updatedChat = await prisma.chat.update({
            where: {
                id: chatId, userId
            },
            data: {
                history: {
                    create: [
                        {
                            role: 'user',
                            text: question,
                        },
                        {
                            role: 'model',
                            text: answer,
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

export default router;
