import { Request, Response } from 'express';
import { StatisticsService } from '../../application/services/statistics.service';
import { StatisticsResponseDto } from '../dtos/statistics/statistics-response.dto';


export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  async getUserStatistics(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'No se pudo autenticar al usuario'
        });
        return;
      }

      const statistics = await this.statisticsService.getUserStatistics(userId);

      const responseDto: StatisticsResponseDto = {
      success: true,
      data: statistics
    };
res.status(200).json(responseDto);
    } catch (error: unknown) {
      console.error('Error al obtener estadísticas del usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        error: 'Ocurrió un error al procesar tu solicitud',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

}
