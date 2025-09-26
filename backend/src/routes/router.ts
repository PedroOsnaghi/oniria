import { Router } from "express";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    //EJEMPLO
    //router.use("/users", userRouter);

    return router;
  }
}
