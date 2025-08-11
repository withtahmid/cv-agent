import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .createType("api_key_type")
        .asEnum(["GEMINI", "OCR", "SHEET_CONFIG", "SHEET_ID", "SHEET_NAME"])
        .execute();

    await db.schema
        .createTable("api_keys")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("name", "varchar", (col) => col.notNull())
        .addColumn("key", "varchar", (col) => col.notNull().unique())
        .addColumn("type", sql`api_key_type`, (col) => col.notNull())
        .addColumn("is_active", "boolean", (col) =>
            col.notNull().defaultTo(false)
        )
        .execute();
    await db.schema
        .createIndex("idx_api_keys_id")
        .on("api_keys")
        .column("id")
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.dropTable("api_keys").execute();
    await db.schema.dropIndex("idx_api_keys_id").execute();
    await db.schema.dropType("api_key_type").execute();
};
