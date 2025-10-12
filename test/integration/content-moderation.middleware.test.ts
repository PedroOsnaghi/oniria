import 'reflect-metadata';
import express from 'express';
import request from 'supertest';
import contentModerationMiddleware from '../../src/infrastructure/middlewares/content-moderation.middleware';

describe('contentModerationMiddleware', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post('/test/interpret', contentModerationMiddleware, (req, res) => res.status(200).json({ ok: true }));
    app.post('/test/reinterpret', contentModerationMiddleware, (req, res) => res.status(200).json({ ok: true }));
  });

  it('blocks when description contains an inappropriate word', async () => {
    const res = await request(app)
      .post('/test/interpret')
      .send({ description: 'Quiero matar a alguien' })
      .expect(400);

    expect(res.body).toHaveProperty('errors');
  });

  it('blocks when previousInterpretation contains a pattern', async () => {
    const res = await request(app)
      .post('/test/reinterpret')
      .send({ description: 'Soñé que volaba', previousInterpretation: 'Te voy a matar' })
      .expect(400);

    expect(res.body).toHaveProperty('errors');
  });

  it('allows benign content', async () => {
    const res = await request(app)
      .post('/test/interpret')
      .send({ description: 'Soñé que volaba sobre montañas y era libre' })
      .expect(200);

    expect(res.body).toEqual({ ok: true });
  });
});
