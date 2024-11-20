import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getNewPrompt(instructions) {
    try {
        const prompt = `${instructions}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 512,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        console.log("Initial AI response:", completion);
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error generating prompt:", error);
        throw error;
    }
}
