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
    return {
        known,
        pool,
        qb,
    };
};
export type Context = inferAsyncReturnType<typeof createContext>;
