import { TRPCError } from "@trpc/server";
import { procedure } from "../index.mjs";

const pseudoAuthorizedProcedure = procedure.use(async ({ ctx, next }) => {
    // if (!ctx.known) {
    //     console.error(
    //         "Unauthorized access attempt to pseudo-authorized procedure"
    //     );
    //     throw new TRPCError({
    //         code: "UNAUTHORIZED",
    //         message: "You are not authorized to perform this action.",
    //     });
    // }
    // console.log("Pseudo-authorized procedure accessed");
    return next({ ctx: { ...ctx, known: true } });
});
export default pseudoAuthorizedProcedure;
