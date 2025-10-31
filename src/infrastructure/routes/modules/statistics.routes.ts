import { Router } from "express";
import { StatisticsController } from "../../controllers/statistics.controller";
import { StatisticsService } from "../../../application/services/statistics.service";
import { DreamNodeRepositorySupabase } from "../../repositories/dream-node.repository.supabase";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { DreamContextService } from "../../../application/services/dream-context.service";

export const statisticsRouter = Router();

const dreamNodeRepository = new DreamNodeRepositorySupabase();
const dreamContextService = new DreamContextService(dreamNodeRepository);
const statisticsService = new StatisticsService(dreamNodeRepository, dreamContextService);
const statisticsController = new StatisticsController(statisticsService);

statisticsRouter.get("/", authenticateToken, (req, res) => statisticsController.getUserStatistics(req, res));

export default statisticsRouter;
