import { z } from "zod";
import pseudoAuthorizedProcedure from "../../../trpc/middlewares/pseudoAuthorized.mjs";
import { safeAwait } from "../../../utils/safeAwait.mjs";
import { TRPCError } from "@trpc/server";

const getSecretList = pseudoAuthorizedProcedure
    .output(z.any())
    .query(async ({ ctx }) => {
        console.log("Fetching secrets list");
        const { data, error } = await safeAwait(
            ctx.qb.selectFrom("api_keys").selectAll().execute()
        );
        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch secrets",
            });
        }
        if (error) {
            console.error("Error fetching secrets:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to fetch secrets",
            });
        }
        return data;
    });
export default getSecretList;
