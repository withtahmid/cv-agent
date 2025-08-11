import { z } from "zod";
import pseudoAuthorizedProcedure from "../../../trpc/middlewares/pseudoAuthorized.mjs";
import { safeAwait } from "../../../utils/safeAwait.mjs";
import { TRPCError } from "@trpc/server";

const addSecretProcedure = pseudoAuthorizedProcedure
    .input(
        z.object({
            key: z.string(),
            name: z.string(),
            type: z.enum([
                "GEMINI",
                "OCR",
                "SHEET_CONFIG",
                "SHEET_ID",
                "SHEET_NAME",
            ]),
        })
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
        const { error } = await safeAwait(
            ctx.qb.transaction().execute(async (trx) => {
                await trx
                    .updateTable("api_keys")
                    .set({ is_active: false })
                    .where("type", "=", input.type)
                    .execute();
                await trx
                    .insertInto("api_keys")
                    .values({
                        name: input.name,
                        key: input.key,
                        type: input.type,
                        is_active: true,
                    })
                    .executeTakeFirstOrThrow();
            })
        );
        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to add secret: ${error.message}`,
            });
        }
        return { success: true, message: "Secret added successfully." };
    });
export default addSecretProcedure;
