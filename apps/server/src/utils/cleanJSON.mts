export const cleanLLMJson = (str: string) => {
    return str
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();
};
