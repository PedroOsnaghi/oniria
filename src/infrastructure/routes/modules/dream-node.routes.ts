import { Router } from "express";
import { DreamNodeController } from "../../controllers/dream-node.controller";
import { InterpretationOpenAIProvider } from "../../providers/interpretation-openAI.provider";
import { InterpretationDreamService } from "../../../application/services/interpretation-dream.service";
import { DreamNodeService } from "../../../application/services/dream-node.service";
import { DreamNodeRepositorySupabase } from "../../repositories/dream-node.repository.supabase";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate-class.middleware";
import { InterpreteDreamRequestDto, ReinterpreteDreamRequestDto, SaveDreamNodeRequestDto } from "../../dtos/dream-node";
import { GetUserNodesParamsDto, GetUserNodesQueryDto } from "../../dtos/dream-node/get-user-nodes.dto";

export const dreamNodeRouter = Router();

const interpretationProvider = new InterpretationOpenAIProvider();
const interpretationDreamService = new InterpretationDreamService(interpretationProvider);
const dreamNodeRepository = new DreamNodeRepositorySupabase();
const dreamNodeService = new DreamNodeService(dreamNodeRepository);
const dreamNodeController = new DreamNodeController(interpretationDreamService, dreamNodeService);

// Endpoints de interpretación
dreamNodeRouter.post("/interpret", validateBody(InterpreteDreamRequestDto), (req, res) => dreamNodeController.interpret(req, res));
dreamNodeRouter.post("/reinterpret", validateBody(ReinterpreteDreamRequestDto), (req, res) => dreamNodeController.reinterpret(req, res));
dreamNodeRouter.post("/save", validateBody(SaveDreamNodeRequestDto), (req, res) => dreamNodeController.save(req, res));
dreamNodeRouter.get("/user/:userId", validateParams(GetUserNodesParamsDto), validateQuery(GetUserNodesQueryDto), (req, res) => dreamNodeController.getUserNodes(req, res));