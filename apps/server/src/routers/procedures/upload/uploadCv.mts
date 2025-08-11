import { z } from "zod";
import pseudoAuthorizedProcedure from "../../../trpc/middlewares/pseudoAuthorized.mjs";

import { TRPCError } from "@trpc/server";
import { cleanLLMJson } from "../../../utils/cleanJSON.mjs";
import { CvExtractSchema } from "../../../utils/extractDataAndFormat.mjs";
import { executePrompt } from "../../../utils/gemini.mjs";
import { insertToGoogleSheets } from "../../../utils/insertToSeet.mjs";
import { logger } from "../../../utils/logger.mjs";
import { extractTextFromBase64Image } from "../../../utils/ocr.mjs";
import { generatePrompt } from "../../../utils/prompt.mjs";
import { safeAwait } from "../../../utils/safeAwait.mjs";

const uploadCVProcedure = pseudoAuthorizedProcedure
    .input(
        z.array(
            z.object({
                image: z.string().describe("Base64 encoded image string"),
                filename: z
                    .string()
                    .describe("Name of the file being uploaded"),
            })
        )
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
        let extractedTexts: string = "";
        for (const image of input) {
            const sizeInMB = (image.image.length / (1024 * 1024)).toFixed(2);
            logger.silly(
                `Processing image: ${image.filename}, size: ${sizeInMB} MB`
            );
            const { error, data } = await safeAwait(
                extractTextFromBase64Image(
                    image.image,
                    ctx.config.OCR_API_KEY.key
                )
            );
            if (error) {
                logger.error(
                    `Error extracting text from image ${image.filename}:`,
                    error
                );
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to extract text from image ${image.filename}`,
                    cause: error,
                });
            }
            extractedTexts += `\n--- Content from ${image.filename} ---\n${data}\n`;
        }
        const prompt = generatePrompt(extractedTexts);
        const { error: promptError, data } = await safeAwait(
            executePrompt(prompt, ctx.config.GEMINI_API_KEY.key)
        );
        if (promptError) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to execute prompt: ${promptError.message}`,
                cause: promptError,
            });
        }
        let parsedData;
        try {
            parsedData = JSON.parse(cleanLLMJson(data));
        } catch (parseError) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Failed to parse LLM response as JSON",
                cause: parseError,
            });
        }
        const formattedData = CvExtractSchema.parse(parsedData);
        const { error: insertError } = await safeAwait(
            insertToGoogleSheets({
                extracted: formattedData,
                SHEET_CONFIG: ctx.config.SHEET_CONFIG.key,
                SHEET_ID: ctx.config.SHEET_ID.key,
                SHEET_NAME: ctx.config.SHEET_NAME.key,
            })
        );
        if (insertError) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to insert data into Google Sheets: ${insertError.message}`,
                cause: insertError,
            });
        }

        return formattedData;
    });

export default uploadCVProcedure;
