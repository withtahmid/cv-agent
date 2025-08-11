import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "./types.mjs";
import createPGPool from "../index.mjs";

export const createQueryBuilder = (): Kysely<DB> => {
    const dialect = new PostgresDialect({
        pool: createPGPool(),
    });
    return new Kysely<DB>({
        dialect,
    });
};
