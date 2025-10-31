import 'reflect-metadata';
import express from 'express';
import request from 'supertest';
import { ContentModerationService } from '../../../../src/application/services/content-moderation.service';

// Mock the ContentModerationService
jest.mock('../../../../src/application/services/content-moderation.service');

// Import the middleware after mocking the service
import contentModerationMiddleware from '../../../../src/infrastructure/middlewares/content-moderation.middleware';

describe('contentModerationMiddleware', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post('/test/interpret', contentModerationMiddleware, (req, res) => res.status(200).json({ ok: true }));
    app.post('/test/reinterpret', contentModerationMiddleware, (req, res) => res.status(200).json({ ok: true }));
  });

  it('blocks when description contains an inappropriate word', async () => {
    // Mock the validateContentInterpretation method to return invalid for specific test case
    const mockValidateContent = ContentModerationService.prototype.validateContentInterpretation as jest.Mock;
    mockValidateContent.mockImplementation((text) => {
      if (text.includes('matar')) {
        return { isValid: false, reason: 'Contenido inapropiado' };
      }
      return { isValid: true };
    });

    const res = await request(app)
      .post('/test/interpret')
      .send({ description: 'Quiero matar a alguien' })
      .expect(400);

    expect(res.body).toHaveProperty('errors');
    expect(mockValidateContent).toHaveBeenCalledWith('Quiero matar a alguien');
  });

  it('blocks when previousInterpretation contains a pattern', async () => {
    // Mock the validateContentInterpretation method to return invalid for specific test case
    const mockValidateContent = ContentModerationService.prototype.validateContentInterpretation as jest.Mock;
    mockValidateContent.mockImplementation((text) => {
      if (text.includes('matar')) {
        return { isValid: false, reason: 'Contenido inapropiado' };
      }
      return { isValid: true };
    });

    const res = await request(app)
      .post('/test/reinterpret')
      .send({ description: 'Soñé que volaba', previousInterpretation: 'Te voy a matar' })
      .expect(400);

    expect(res.body).toHaveProperty('errors');
    expect(mockValidateContent).toHaveBeenCalledWith('Te voy a matar');
  });

  it('allows benign content', async () => {
    // Mock the validateContentInterpretation method to always return valid for this test
    const mockValidateContent = ContentModerationService.prototype.validateContentInterpretation as jest.Mock;
    mockValidateContent.mockReturnValue({ isValid: true });

    const res = await request(app)
      .post('/test/interpret')
      .send({ description: 'Soñé que volaba sobre montañas y era libre' })
      .expect(200);

    expect(res.body).toEqual({ ok: true });
    expect(mockValidateContent).toHaveBeenCalledWith('Soñé que volaba sobre montañas y era libre');
  });
});
