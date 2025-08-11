import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .createTable("requests")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("GEMINI_ID", "varchar", (col) =>
            col.notNull().references("api_keys.key").onDelete("restrict")
        )
        .addColumn("OCR_ID", "varchar", (col) =>
            col.notNull().references("api_keys.key").onDelete("restrict")
        )
        .addColumn("SHEET_NAME", "varchar", (col) =>
            col.notNull().references("api_keys.key").onDelete("restrict")
        )
        .addColumn("SHEET_ID", "varchar", (col) =>
            col.notNull().references("api_keys.key").onDelete("restrict")
        )
        .addColumn("created_at", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`NOW()`)
        )
        .addColumn("finished_at", "timestamptz")
        .addColumn("num_file", "integer", (col) => col.notNull())
        .addColumn("error", "jsonb")
        .execute();

    await db.schema
        .createIndex("idx_requests_id")
        .on("requests")
        .column("id")
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.dropIndex("idx_requests_id").execute();
    await db.schema.dropTable("requests").execute();
};
