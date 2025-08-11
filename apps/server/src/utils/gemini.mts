import { GoogleGenerativeAI } from "@google/generative-ai";
export const executePrompt = async (prompt: string, GEMINI_API_KEY: string) => {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
};
