import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
   // apiKey: "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",
   //  dangerouslyAllowBrowser: true
});

export async function getCompletion(message, style, tone) {
    try {
        const prompt = `Please rewrite the following text in a ${style} style and a ${tone} tone:\n\n"${message}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        // Возврат текста, созданного ИИ
        console.log("Completion response:", completion);
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error fetching completion:", error);
    }
}

