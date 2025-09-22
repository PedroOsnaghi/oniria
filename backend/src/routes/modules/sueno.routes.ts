import { Router } from "express";
import { SuenoController } from "../../controllers/sueno.controller";
import { SuenoService } from "../../services/sueno.service";

export const suenoRouter = Router();

const suenoService = new SuenoService();
const suenoController = new SuenoController(suenoService);

suenoRouter.post("/interpretar", suenoController.interpretar.bind(suenoController));
