import { Router } from "express";
import { usuarioRouter } from "./modules/usuario.routes";
export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/usuario", usuarioRouter);

    return router;
  }
}
