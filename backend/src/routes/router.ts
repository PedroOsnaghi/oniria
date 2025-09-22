import { Router } from "express";
import { usuarioRouter } from "./modules/usuario.routes";
import { suenoRouter } from "./modules/sueno.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/usuario", usuarioRouter);
    router.use("/sueno", suenoRouter);

    return router;
  }
}
