jest.mock('../../../../src/config/envs', () => ({
    envs: {
        SUPABASE_URL: 'https://fake.supabase.co',
        SUPABASE_KEY: 'fake-key',
        SUPABASE_JWT_SECRET: 'secret',
        PORT: 3000,
        OPENAI_API_KEY: 'fake-key'
    }
}));
import { DreamNodeRepositorySupabase } from '../../../../src/infrastructure/repositories/dream-node.repository.supabase';
import { supabase } from '../../../../src/config/supabase';
import { dreamNodeMock } from '../../mocks/dream-node.mock';

describe('DreamNodeRepositorySupabase', () => {
    let repo: DreamNodeRepositorySupabase;
    let mockSupabase: jest.Mocked<typeof supabase>;

    beforeEach(() => {
        jest.clearAllMocks();

        const singleMock = jest.fn().mockResolvedValue({ data: dreamNodeMock, error: null });
        const selectMock = jest.fn(() => ({ single: singleMock }));
        const insertMock = jest.fn((values: any) => ({ select: selectMock }));
        const fromMock = jest.fn((table: string) => ({ insert: insertMock }));

        mockSupabase = supabase as jest.Mocked<typeof supabase>;
        mockSupabase.from = fromMock as any;



        repo = new DreamNodeRepositorySupabase();
    });

    it('should correctly insert a dream node', async () => {
        await expect(repo.save(dreamNodeMock, 'user-1')).resolves.toBeUndefined();

        expect(mockSupabase.from).toHaveBeenCalledWith('dream_node');
        expect(mockSupabase.from('dream_node').insert).toHaveBeenCalledWith(expect.objectContaining({
            id: '550e8400-e29b-41d4-a716-446655440001',
            profile_id: 'user-1',
            title: 'Mi primer sueño en Oniria',
        }));
        expect(mockSupabase.from('dream_node').insert(expect.any(Object)).select).toHaveBeenCalled();
        expect(mockSupabase.from('dream_node').insert(expect.any(Object)).select().single).toHaveBeenCalled();
    });

    it('should throw error if Supabase returns error', async () => {
        (mockSupabase.from('dream_node').insert(expect.any(Object)).select().single as jest.Mock).mockResolvedValueOnce({
            data: null,
            error: { message: 'Error al insertar' }
        });

        await expect(repo.save(dreamNodeMock, 'user-1')).rejects.toThrow('Error al insertar');
    });

});
