import { TRPCError } from "@trpc/server";
import { procedure } from "../index.mjs";
import { safeAwait } from "../../utils/safeAwait.mjs";

const pseudoAuthorizedProcedure = procedure.use(async ({ ctx, next }) => {
    return next({
        ctx: {
            ...ctx,
            known: true,
        },
    });
});
export default pseudoAuthorizedProcedure;
