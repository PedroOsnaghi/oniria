import { Router } from "express";
import { DreamNodeController } from "../../controllers/dream-node.controller";
import { DreamNodeService } from "../../services/dream-node.service";

export const dreamNodeRouter = Router();

const dreamNodeService = new DreamNodeService();
const dreamNodeController = new DreamNodeController(dreamNodeService);

// Solo el endpoint de interpretación
dreamNodeRouter.post("/interpret", (req, res) => dreamNodeController.interpret(req, res));