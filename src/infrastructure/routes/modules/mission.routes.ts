import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { MissionRepositorySupabase } from '../../repositories/mission.repository.supabase';
import { MissionController } from '../../controllers/mission.controller';

export const missionRouter = Router();

const missionRepository = new MissionRepositorySupabase();
const controller = new MissionController(missionRepository);

missionRouter.get('/my', authenticateToken, (req, res) => controller.myMissions(req, res));
