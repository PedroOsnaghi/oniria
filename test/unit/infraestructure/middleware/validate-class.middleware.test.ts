import express, { Request, Response } from 'express';
import request from 'supertest';
import { ReinterpreteDreamRequestDto } from './../../../src/infrastructure/dtos/dream-node/reinterprete-dream.dto';
import { validateBody } from '../../../src/infrastructure/middlewares/validate-class.middleware';

describe('validateBody(ReinterpreteDreamRequestDto) Middleware', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post(
      '/test',
      validateBody(ReinterpreteDreamRequestDto),
      (_req: Request, res: Response) => {
        return res.status(200).json({ ok: true });
      }
    );
  });

  it('should accept valid request body', async () => {
    const response = await request(app)
      .post('/test')
      .send({
        description: 'Soñé que volaba sobre una ciudad desconocida',
        previousInterpretation: 'Tu sueño refleja el deseo de explorar nuevos horizontes'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('should return 400 for missing description', async () => {
    const response = await request(app)
      .post('/test')
      .send({
        previousInterpretation: 'Texto válido'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0].field).toBe('description');
  });

  it('should return 400 for invalid JSON', async () => {
    const response = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send('{"description":') // Broken JSON

    expect(response.status).toBe(400);
  });

  it('should return 400 for too short description', async () => {
    const response = await request(app)
      .post('/test')
      .send({
        description: 'abc',
        previousInterpretation: 'Texto válido'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('description');
  });
});
