import { z } from "zod";
import pseudoAuthorizedProcedure from "../../../trpc/middlewares/pseudoAuthorized.mjs";
import { safeAwait } from "../../../utils/safeAwait.mjs";
import { TRPCError } from "@trpc/server";
import { sql } from "kysely";

const getSecretList = pseudoAuthorizedProcedure
    .output(
        z.array(
            z.object({
                id: z.number(),
                is_active: z.boolean(),
                key: z.string(),
                name: z.string(),
                type: z.enum([
                    "GEMINI",
                    "OCR",
                    "SHEET_CONFIG",
                    "SHEET_ID",
                    "SHEET_NAME",
                ]),
                total_usage: z.number(),
                last_24h_usage: z.number(),
            })
        )
    )
    .query(async ({ ctx }) => {
        const { data: list, error: listError } = await safeAwait(
            ctx.qb
                .selectFrom("api_keys")
                .leftJoin("requests", (join) =>
                    join.on((eb) =>
                        eb.or([
                            eb(
                                "requests.GEMINI_ID",
                                "=",
                                eb.ref("api_keys.key")
                            ),
                            eb("requests.OCR_ID", "=", eb.ref("api_keys.key")),
                            eb(
                                "requests.SHEET_NAME",
                                "=",
                                eb.ref("api_keys.key")
                            ),
                            eb(
                                "requests.SHEET_ID",
                                "=",
                                eb.ref("api_keys.key")
                            ),
                        ])
                    )
                )
                .select([
                    "api_keys.id",
                    "api_keys.name",
                    "api_keys.key",
                    "api_keys.type",
                    "api_keys.is_active",
                    sql<string>`count(requests.id)`.as("total_usage"),
                    sql<string>`count(case when requests.created_at > now() - interval '1 day' then 1 end)`.as(
                        "last_24h_usage"
                    ),
                ])
                .groupBy([
                    "api_keys.id",
                    "api_keys.name",
                    "api_keys.key",
                    "api_keys.type",
                    "api_keys.is_active",
                ])
                .orderBy("api_keys.id")
                .execute()
        );

        if (listError) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch secrets",
            });
        }

        // Convert the count results to numbers (they come as strings from SQL)
        const formattedList = list.map((item) => ({
            ...item,
            total_usage: item.total_usage ? parseInt(item.total_usage, 10) : 0,
            last_24h_usage: item.last_24h_usage
                ? parseInt(item.last_24h_usage, 10)
                : 0,
        }));
        return formattedList;
    });

export default getSecretList;
