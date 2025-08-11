import { z } from "zod";
import pseudoAuthorizedProcedure from "../../../trpc/middlewares/pseudoAuthorized.mjs";
import { safeAwait } from "../../../utils/safeAwait.mjs";
import { TRPCError } from "@trpc/server";

const updateSecrets = pseudoAuthorizedProcedure
    .input(
        z.array(
            z.object({
                id: z.number(),
                is_active: z.boolean(),
            })
        )
    ) // Assuming no input is needed, adjust as necessary
    .output(z.any())
    .query(async ({ ctx, input }) => {
        const { data, error } = await safeAwait(
            ctx.qb.transaction().execute(async (trx) => {
                await trx
                    .updateTable("api_keys")
                    .set({ is_active: false })
                    .execute();
                await trx
                    .updateTable("api_keys")
                    .set({ is_active: true })
                    .where(
                        "id",
                        "in",
                        input.filter((i) => i.is_active).map((i) => i.id)
                    )
                    .execute();
            })
        );
        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch secrets",
            });
        }
        return data;
    });
export default updateSecrets;
