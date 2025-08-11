import { router } from "../trpc/index.mjs";
import publicProcedure from "../trpc/middlewares/public.mjs";
import addSecretProcedure from "./procedures/secrets/add.mjs";
import getSecretList from "./procedures/secrets/getList.mjs";
import updateSecrets from "./procedures/secrets/update.mjs";
import uploadCVProcedure from "./procedures/upload/uploadCv.mjs";
// import publicProcedure from "../trpc/procedures/public.mjs";

export const appRouter = router({
    hello: publicProcedure.query(async () => "Hello From App Router"),
    upload: uploadCVProcedure,
    secrets: router({
        add: addSecretProcedure,
        list: getSecretList,
        update: updateSecrets,
    }),
});
export type AppRouter = typeof appRouter;
