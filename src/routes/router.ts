import { Router } from "express";
import { usuarioRouter } from "./modules/usuario.routes";
export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.get("/", (req, res) => {
      res.send("API Oniria v1 funcionando correctamente");
    });

    router.use("/usuario", usuarioRouter);

    return router;
  }
}
