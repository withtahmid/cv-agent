import { ocrSpace } from "ocr-space-api-wrapper";
import { logger } from "./logger.mjs";
export const extractTextFromBase64Image = async (
    base64Img: string,
    OCR_API_KEY: string
): Promise<string> => {
    const res = await ocrSpace(base64Img, {
        apiKey: OCR_API_KEY,
        language: "eng",
    });
    const text = res.ParsedResults[0].ParsedText;
    return text;
};
