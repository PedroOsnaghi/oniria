import { Router } from "express";
import { DreamNodeController } from "../../controllers/dream-node.controller";
import { InterpretationOpenAIProvider } from "../../providers/interpretation-openAI.provider";
import { InterpretationDreamService } from "../../../application/services/interpreation-dream.service";

export const dreamNodeRouter = Router();

const interpretationProvider = new InterpretationOpenAIProvider();
const dreamNodeService = new InterpretationDreamService(interpretationProvider);
const dreamNodeController = new DreamNodeController(dreamNodeService);

// Solo el endpoint de interpretación
dreamNodeRouter.post("/interpret", (req, res) => dreamNodeController.interpret(req, res));