import { Router } from "express";
import { dreamNodeRouter } from "./modules/dream-node.routes";
import { badgeRouter } from "./modules/badge.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        router.get("/hello", (req, res) => res.send("Oniria API"));
        router.use("/api/dreams", dreamNodeRouter);
    router.use("/api/badges", badgeRouter);

        return router;
    }
}
