import { Router } from "express";
import { dreamNodeRouter } from "./modules/dream-node.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        router.get("/hello", (req, res) => res.send("Oniria API"));
        router.use("/api/dreams", dreamNodeRouter);

        return router;
    }
}
