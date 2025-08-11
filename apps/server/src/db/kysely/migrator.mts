import { Kysely, PostgresDialect } from "kysely";
import { promises as fs } from "fs";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Migrator, FileMigrationProvider } from "kysely";
import pg, { Pool } from "pg";

import createPGPool from "../index.mjs";
import { logger } from "../../utils/logger.mjs";
// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Kysely<any>({
    dialect: new PostgresDialect({
        pool: createPGPool(),
    }),
});

export const migrate = async (forward: boolean): Promise<void> => {
    const migrator = new Migrator({
        db: db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder: path.join(__dirname, "./migrations"),
        }),
    });

    const { error, results } = forward
        ? await migrator.migrateToLatest()
        : await migrator.migrateDown();

    const migrationResults: {
        Migration: string;
        Status: string;
    }[] = [];

    results?.forEach((it) => {
        if (it.status === "Success") {
            migrationResults.push({
                Migration: it.migrationName,
                Status: "✅ Success",
            });
        } else if (it.status === "Error") {
            migrationResults.push({
                Migration: it.migrationName,
                Status: "❌ Error",
            });
        }
    });

    const maxMigrationWidth = Math.max(
        ...migrationResults.map((it) => it.Migration.length),
        "Migration".length
    );
    const maxStatusWidth = Math.max(
        ...migrationResults.map((it) => it.Status.length),
        "Status".length
    );
    const header = `| ${"Migration".padEnd(maxMigrationWidth)} | ${"Status".padEnd(maxStatusWidth)} |`;
    const divider = `|${"-".repeat(maxMigrationWidth + 2)}|${"-".repeat(maxStatusWidth + 2)}|`;

    console.log(divider);
    console.log(header);
    console.log(divider);

    migrationResults.forEach((it) => {
        const row = `| ${it.Migration.padEnd(maxMigrationWidth)} | ${it.Status.padEnd(maxStatusWidth)} |`;
        console.log(row);
    });

    console.log(divider);

    if (error) {
        console.error("failed to migrate");
        console.error(error);
        process.exit(1);
    }
    if (error) {
        console.error("failed to migrate");
        console.error(error);
        process.exit(1);
    }
};

export const run_migration = async ({
    migrateMode,
}: {
    migrateMode: "up" | "down";
}) => {
    logger.debug(`Running migration in ${migrateMode} mode...`);
    if (migrateMode !== "up" && migrateMode !== "down") {
        throw new Error("Invalid migrateMode. Use 'up' or 'down'.");
    }
    try {
        await migrate(migrateMode === "up");
    } catch (error) {
        console.error(error);
    }
    logger.debug(`Migration in ${migrateMode} mode completed.`);
};
