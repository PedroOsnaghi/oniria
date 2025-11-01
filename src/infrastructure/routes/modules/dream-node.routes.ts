import { Router } from "express";
import { DreamNodeController } from "../../controllers/dream-node.controller";
import { InterpretationOpenAIProvider } from "../../providers/interpretation-openAI.provider";
import { InterpretationDreamService } from "../../../application/services/interpretation-dream.service";
import { DreamNodeService } from "../../../application/services/dream-node.service";
import { DreamNodeRepositorySupabase } from "../../repositories/dream-node.repository.supabase";
import { validateBody, validateQuery } from "../../middlewares/validate-class.middleware";
import contentModerationMiddleware from '../../middlewares/content-moderation.middleware';
import { InterpreteDreamRequestDto, ReinterpreteDreamRequestDto, SaveDreamNodeRequestDto } from "../../dtos/dream-node";
import { GetUserNodesRequestDto } from "../../dtos/dream-node/get-user-nodes.dto";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { DreamContextService } from "../../../application/services/dream-context.service";
import { IllustrationGeminiProvider } from "../../providers/illustration-gemini.provider";
import { IllustrationDreamService } from "../../../application/services/illustration-dream.service";
import { MissionService } from "../../../application/services/mission.service";
import { MissionRepositorySupabase } from "../../repositories/mission.repository.supabase";
import { BadgeRepositorySupabase } from "../../repositories/badge.repository.supabase";
import { validateAudio } from "../../middlewares/upload";
import { TranscripcionController } from "../../controllers/transcription.controller";
import { TranscriptionWhisperProvider } from "../../providers/transcription-whisper.provider";
import { TranscriptionService } from "../../../application/services/transcription.service";
import { UpdateDreamNodeRequestDto } from "../../dtos/dream-node/update-dream-node.dto";

export const dreamNodeRouter = Router();

const interpretationProvider = new InterpretationOpenAIProvider();
const illustrationProvider = new IllustrationGeminiProvider();
const illustrationService = new IllustrationDreamService(illustrationProvider);
const interpretationDreamService = new InterpretationDreamService(interpretationProvider);
const dreamNodeRepository = new DreamNodeRepositorySupabase();
const missionRepository = new MissionRepositorySupabase();
const badgeRepository = new BadgeRepositorySupabase();
const missionService = new MissionService(dreamNodeRepository, missionRepository, badgeRepository);
const dreamNodeService = new DreamNodeService(dreamNodeRepository, missionService);
const contextService = new DreamContextService(dreamNodeRepository);
const dreamNodeController = new DreamNodeController(interpretationDreamService, dreamNodeService, illustrationService, contextService);
const transcriptionProvider = new TranscriptionWhisperProvider();
const transcriptionService = new TranscriptionService(transcriptionProvider);
const transcriptionController = new TranscripcionController(transcriptionService);

// Endpoints de interpretación
dreamNodeRouter.post("/interpret", authenticateToken, validateBody(InterpreteDreamRequestDto), contentModerationMiddleware, (req, res) => dreamNodeController.interpret(req, res));
dreamNodeRouter.post("/reinterpret", authenticateToken, validateBody(ReinterpreteDreamRequestDto), contentModerationMiddleware, (req, res) => dreamNodeController.reinterpret(req, res));
dreamNodeRouter.post("/save", authenticateToken, validateBody(SaveDreamNodeRequestDto), (req, res) => dreamNodeController.save(req, res));
dreamNodeRouter.post("/transcribe", authenticateToken, validateAudio, (req, res) => transcriptionController.transcribeAudio(req, res));
dreamNodeRouter.get("/history", authenticateToken, validateQuery(GetUserNodesRequestDto), (req, res) => dreamNodeController.getUserNodes(req, res));
dreamNodeRouter.get("/user", authenticateToken, (req, res) => dreamNodeController.showUser(req, res));
dreamNodeRouter.put("/update", authenticateToken, validateBody(UpdateDreamNodeRequestDto), (req, res) => dreamNodeController.update(req, res));
