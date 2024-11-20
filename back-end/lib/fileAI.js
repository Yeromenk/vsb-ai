import OpenAI from 'openai';
import mammoth from 'mammoth';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getFile(file, action) {
    try {
        const prompt = `Please ${action} the following file:\n\n"${file}". Write only the ${action}, without the quotation marks`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{role: "user", content: prompt}],
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        console.log("Completion response:", completion);
        return completion.choices[0].message.content.split("\n").map((line) => {
            return line.trim();
        })
    } catch (error) {
        console.error("Error fetching completion(file):", error);
    }
}

export async function extractTextFromDocx(filePath) {
    try {
        const result = await mammoth.extractRawText({path: filePath});
        return result.value;
    } catch (e) {
        console.error("Error in extractTextFromDocx:", e);
    }
}