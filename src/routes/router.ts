import { Router } from "express";
import { dreamNodeRouter } from "./modules/dream-node.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        router.use("/", (req, res) => res.send("Oniria API"));
        router.use("/api/dream-node", dreamNodeRouter);

        return router;
    }
}
