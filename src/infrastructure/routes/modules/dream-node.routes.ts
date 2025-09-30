import { Router } from "express";
import { DreamNodeController } from "../../controllers/dream-node.controller";
import { InterpretationOpenAIProvider } from "../../providers/interpretation-openAI.provider";
import { InterpretationDreamService } from "../../../application/services/interpreation-dream.service";
import { DreamNodeService } from "../../../application/services/dream-node.service";
import { DreamNodeRepositorySupabase } from "../../repositories/dream-node.repository.supabase";

export const dreamNodeRouter = Router();

const interpretationProvider = new InterpretationOpenAIProvider();
const interpretationDreamService = new InterpretationDreamService(interpretationProvider);
const dreamNodeRepository = new DreamNodeRepositorySupabase();
const dreamNodeService = new DreamNodeService(dreamNodeRepository);
const dreamNodeController = new DreamNodeController(interpretationDreamService, dreamNodeService);

// Endpoints de interpretación
dreamNodeRouter.post("/interpret", (req, res) => dreamNodeController.interpret(req, res));
dreamNodeRouter.post("/reinterpret", (req, res) => dreamNodeController.reinterpret(req, res));
dreamNodeRouter.post("/save", (req, res) => dreamNodeController.save(req, res));