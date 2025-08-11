import { inferAsyncReturnType } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import createPGPool from "../db/index.mjs";
import { createQueryBuilder } from "../db/kysely/index.mjs";
import { getUserFromAuthHeader } from "./auth.mjs";
import { logger } from "../utils/logger.mjs";
// import { createServices } from "../services.mjs";

const pool = createPGPool();
const qb = createQueryBuilder();

export const createContext = async ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => {
    const headers = req.headers;
    const hostname = req.headers.hostname;
    // const user = await getUserFromAuthHeader(req.headers.authorization);
    const known = req.headers.authorization === process.env.KNOWN_AUTH_HEADER;
    console.log(`Creating context for ${hostname} with known: ${known}`);
    const GEMINI_API_KEY = await qb
        .selectFrom("api_keys")
        .selectAll()
        .where("type", "=", "GEMINI")
        .where("is_active", "=", true)
        .executeTakeFirstOrThrow();
    const OCR_API_KEY = await qb
        .selectFrom("api_keys")
        .selectAll()
        .where("type", "=", "OCR")
        .where("is_active", "=", true)
        .executeTakeFirstOrThrow();
    const SHEET_CONFIG = await qb
        .selectFrom("api_keys")
        .selectAll()
        .where("type", "=", "SHEET_CONFIG")
        .where("is_active", "=", true)
        .executeTakeFirstOrThrow();
    const SHEET_ID = await qb
        .selectFrom("api_keys")
        .selectAll()
        .where("type", "=", "SHEET_ID")
        .where("is_active", "=", true)
        .executeTakeFirstOrThrow();
    const SHEET_NAME = await qb
        .selectFrom("api_keys")
        .selectAll()
        .where("type", "=", "SHEET_NAME")
        .where("is_active", "=", true)
        .executeTakeFirstOrThrow();
    console.log(`Context created for ${hostname} with known: ${known}`);

    return {
        known,
        pool,
        qb,
        config: {
            GEMINI_API_KEY,
            OCR_API_KEY,
            SHEET_CONFIG,
            SHEET_ID,
            SHEET_NAME,
        },
    };
};
export type Context = inferAsyncReturnType<typeof createContext>;
