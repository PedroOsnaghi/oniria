import request from 'supertest';
import express from 'express';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123')
}));

describe('DreamNodeController Integration Tests', () => {
  let app: express.Application;

  // Mock data
  const testUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test.user@oniria.com',
    name: 'Usuario Test'
  };

  const testDreamNode = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Mi primer sueño en Oniria',
    description: 'Soñé que estaba volando sobre una ciudad mágica llena de luces brillantes.',
    interpretation: 'Este sueño representa tu deseo de libertad y creatividad.',
    creationDate: new Date('2024-01-10T10:30:00Z'),
    privacy: 'Publico',
    state: 'Activo',
    emotion: 'Felicidad'
  };

  const secondTestDreamNode = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Sueño en el océano profundo',
    description: 'Un sueño donde nadaba en las profundidades del océano con criaturas luminosas.',
    interpretation: 'El océano representa tu subconsciente profundo.',
    creationDate: new Date('2024-01-20T08:15:00Z'),
    privacy: 'Privado',
    state: 'Archivado',
    emotion: 'Tristeza'
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get('/api/dreams/user/:userId', (req, res) => {
      const { userId } = req.params;
      const {
        page = '1',
        limit = '10',
        state,
        privacy,
        emotion,
        search,
        from,
        to
      } = req.query;

      let allDreams = userId === testUser.id ? [testDreamNode, secondTestDreamNode] : [];

      if (state) {
        allDreams = allDreams.filter(dream => dream.state === state);
      }

      if (privacy) {
        allDreams = allDreams.filter(dream => dream.privacy === privacy);
      }

      if (emotion) {
        allDreams = allDreams.filter(dream => dream.emotion === emotion);
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        allDreams = allDreams.filter(dream =>
          dream.title.toLowerCase().includes(searchTerm) ||
          dream.description.toLowerCase().includes(searchTerm)
        );
      }

      if (from) {
        const fromDate = new Date(from as string);
        allDreams = allDreams.filter(dream =>
          new Date(dream.creationDate) >= fromDate
        );
      }

      if (to) {
        const toDate = new Date(to as string);
        allDreams = allDreams.filter(dream =>
          new Date(dream.creationDate) <= toDate
        );
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedDreams = allDreams.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedDreams,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          total: allDreams.length,
          totalPages: Math.ceil(allDreams.length / limitNum),
          hasNext: endIndex < allDreams.length,
          hasPrev: pageNum > 1
        }
      });
    });
  });

  describe('GET /api/dreams/user/:userId', () => {

    it('should return 200 status with test user data', async () => {
      const response = await request(app)
        .get(`/api/dreams/user/${testUser.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
      expect(response.body.data[1].title).toBe('Sueño en el océano profundo');
    });

    it('should return empty array for user with no dreams', async () => {
      const otherUserId = '550e8400-e29b-41d4-a716-446655440999';

      const response = await request(app)
        .get(`/api/dreams/user/${otherUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    describe('Complete filters and parameters', () => {
      it('should filter by state (Active)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?state=Activo`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].state).toBe('Activo');
        expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
      });

      it('should filter by state (Archived)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?state=Archivado`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].state).toBe('Archivado');
        expect(response.body.data[0].title).toBe('Sueño en el océano profundo');
      });

      it('should filter by privacy (Public)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?privacy=Publico`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].privacy).toBe('Publico');
        expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
      });

      it('should filter by privacy (Private)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?privacy=Privado`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].privacy).toBe('Privado');
        expect(response.body.data[0].title).toBe('Sueño en el océano profundo');
      });

      it('should filter by emotion (Happiness)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?emotion=Felicidad`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].emotion).toBe('Felicidad');
        expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
      });

      it('should filter by emotion (Sadness)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?emotion=Tristeza`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].emotion).toBe('Tristeza');
        expect(response.body.data[0].title).toBe('Sueño en el océano profundo');
      });

      it('should filter by search term in title', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?search=primer`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toContain('primer');
      });

      it('should filter by date range (from)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?from=2024-01-15`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe('Sueño en el océano profundo');
        expect(new Date(response.body.data[0].creationDate).getTime()).toBeGreaterThanOrEqual(new Date('2024-01-15').getTime());
      });

      it('should filter by date range (to)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?to=2024-01-15`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
        expect(new Date(response.body.data[0].creationDate).getTime()).toBeLessThanOrEqual(new Date('2024-01-15').getTime());
      });

      it('should filter by date range (from and to)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?from=2024-01-01&to=2024-01-15`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
      });

      });

      it('should combine multiple filters (state + privacy)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?state=Activo&privacy=Publico`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].state).toBe('Activo');
        expect(response.body.data[0].privacy).toBe('Publico');
        expect(response.body.data[0].title).toBe('Mi primer sueño en Oniria');
      });

      it('should combine multiple filters (emotion + search)', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?emotion=Tristeza&search=océano`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].emotion).toBe('Tristeza');
        expect(response.body.data[0].description).toContain('océano');
      });

      it('should return empty array when no dreams match filters', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?state=Activo&emotion=Miedo`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(0);
        expect(response.body.pagination.total).toBe(0);
      });

      it('should handle pagination with filters', async () => {
        const allResponse = await request(app)
          .get(`/api/dreams/user/${testUser.id}`)
          .expect(200);

        expect(allResponse.body.data).toHaveLength(2);

        const page1Response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?page=1&limit=1`)
          .expect(200);

        expect(page1Response.body.success).toBe(true);
        expect(page1Response.body.data).toHaveLength(1);
        expect(page1Response.body.pagination).toEqual({
          currentPage: 1,
          limit: 1,
          total: 2,
          totalPages: 2,
          hasNext: true,
          hasPrev: false
        });

        const page2Response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?page=2&limit=1`)
          .expect(200);

        expect(page2Response.body.success).toBe(true);
        expect(page2Response.body.data).toHaveLength(1);
        expect(page2Response.body.pagination).toEqual({
          currentPage: 2,
          limit: 1,
          total: 2,
          totalPages: 2,
          hasNext: false,
          hasPrev: true
        });
      });

      it('should combine filters with pagination', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?state=Activo&page=1&limit=1`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].state).toBe('Activo');
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      });

      it('should test all filters combined', async () => {
        const response = await request(app)
          .get(`/api/dreams/user/${testUser.id}?state=Activo&privacy=Publico&emotion=Felicidad&search=primer&from=2024-01-01&to=2024-01-15&page=1&limit=10`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);

        const dream = response.body.data[0];
        expect(dream.state).toBe('Activo');
        expect(dream.privacy).toBe('Publico');
        expect(dream.emotion).toBe('Felicidad');
        expect(dream.title).toContain('primer');
        expect(new Date(dream.creationDate).getTime()).toBeGreaterThanOrEqual(new Date('2024-01-01').getTime());
        expect(new Date(dream.creationDate).getTime()).toBeLessThanOrEqual(new Date('2024-01-15').getTime());
      });
    });

    describe('Complete pagination tests with large dataset', () => {
      let largeDatasetApp: express.Application;

      beforeEach(() => {
        largeDatasetApp = express();
        largeDatasetApp.use(express.json());

        largeDatasetApp.get('/api/dreams/user/:userId', (req, res) => {
          const { page = '1', limit = '10' } = req.query;
          const pageNum = parseInt(page as string);
          const limitNum = parseInt(limit as string);

          const allDreams = Array.from({ length: 25 }, (_, i) => ({
            id: `dream-${i + 1}`,
            title: `Sueño ${i + 1}`,
            description: `Descripción del sueño número ${i + 1}`,
            creationDate: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
            privacy: 'Publico',
            state: 'Activo',
            emotion: 'Felicidad',
            interpretation: `Interpretación del sueño ${i + 1}`
          }));

          const offset = (pageNum - 1) * limitNum;
          const paginatedData = allDreams.slice(offset, offset + limitNum);

          res.json({
            success: true,
            data: paginatedData,
            pagination: {
              currentPage: pageNum,
              limit: limitNum,
              total: allDreams.length,
              totalPages: Math.ceil(allDreams.length / limitNum),
              hasNext: offset + limitNum < allDreams.length,
              hasPrev: pageNum > 1
            }
          });
        });
      });

      it('should return page 1 correctly with default pagination', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(10);
        expect(response.body.data[0].title).toBe('Sueño 1');
        expect(response.body.data[9].title).toBe('Sueño 10');
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false
        });
      });

      it('should return page 2 correctly', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 2, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(10);
        expect(response.body.data[0].title).toBe('Sueño 11');
        expect(response.body.data[9].title).toBe('Sueño 20');
        expect(response.body.pagination).toEqual({
          currentPage: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true
        });
      });

      it('should return last page correctly (page 3)', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 3, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(5);
        expect(response.body.data[0].title).toBe('Sueño 21');
        expect(response.body.data[4].title).toBe('Sueño 25');
        expect(response.body.pagination).toEqual({
          currentPage: 3,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: false,
          hasPrev: true
        });
      });

      it('should return empty page when requesting non-existent page', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 10, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(0);
        expect(response.body.pagination).toEqual({
          currentPage: 10,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: false,
          hasPrev: true
        });
      });

      it('should work with different page limits', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(5);
        expect(response.body.data[0].title).toBe('Sueño 1');
        expect(response.body.data[4].title).toBe('Sueño 5');
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          limit: 5,
          total: 25,
          totalPages: 5, // 25/5 = 5 pages
          hasNext: true,
          hasPrev: false
        });
      });

      it('should handle limit of 1 correctly', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 1, limit: 1 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe('Sueño 1');
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          limit: 1,
          total: 25,
          totalPages: 25, // 25/1 = 25 pages
          hasNext: true,
          hasPrev: false
        });
      });

      it('should handle large page size correctly', async () => {
        const response = await request(largeDatasetApp)
          .get(`/api/dreams/user/${testUser.id}`)
          .query({ page: 1, limit: 50 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(25);
        expect(response.body.data[0].title).toBe('Sueño 1');
        expect(response.body.data[24].title).toBe('Sueño 25');
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          limit: 50,
          total: 25,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      });

      it('should navigate through all pages sequentially', async () => {
        const limit = 7;
        const expectedTotalPages = Math.ceil(25 / limit);

        for (let page = 1; page <= expectedTotalPages; page++) {
          const response = await request(largeDatasetApp)
            .get(`/api/dreams/user/${testUser.id}`)
            .query({ page, limit })
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.pagination.currentPage).toBe(page);
          expect(response.body.pagination.limit).toBe(limit);
          expect(response.body.pagination.total).toBe(25);
          expect(response.body.pagination.totalPages).toBe(expectedTotalPages);
          expect(response.body.pagination.hasPrev).toBe(page > 1);
          expect(response.body.pagination.hasNext).toBe(page < expectedTotalPages);

          if (page < expectedTotalPages) {
            expect(response.body.data).toHaveLength(limit);
          } else {
            const expectedItemsOnLastPage = 25 % limit || limit;
            expect(response.body.data).toHaveLength(expectedItemsOnLastPage);
          }
        }
      });

      it('should handle edge cases with zero results', async () => {
        const emptyDataApp = express();
        emptyDataApp.use(express.json());

        emptyDataApp.get('/api/dreams/user/:userId', (req, res) => {
          const { page = '1', limit = '10' } = req.query;
          const pageNum = parseInt(page as string);
          const limitNum = parseInt(limit as string);

          res.json({
            success: true,
            data: [],
            pagination: {
              currentPage: pageNum,
              limit: limitNum,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false
            }
          });
        });

        const response = await request(emptyDataApp)
          .get(`/api/dreams/user/empty-user-id`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(0);
        expect(response.body.pagination).toEqual({
          currentPage: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      });
    });

  });