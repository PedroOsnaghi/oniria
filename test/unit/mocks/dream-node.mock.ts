import { DreamPrivacy, DreamState, DreamTypeName, Emotion, IDreamNode } from '../../../src/domain/models/dream-node.model';

export const dreamNodeMock: IDreamNode = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    creationDate: new Date('2024-01-10T10:30:00Z'),
    title: 'Mi primer sueño en Oniria',
    dream_description: 'Soñé que estaba volando sobre una ciudad mágica llena de luces brillantes.',
    interpretation: 'Este sueño representa tu deseo de libertad y creatividad.',
    privacy: 'Publico' as DreamPrivacy,
    state: 'Activo' as DreamState,
    emotion: 'Felicidad' as Emotion,
    type: 'Lúcido' as DreamTypeName
};

export const dreamNodeMockTwo: IDreamNode = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    creationDate: new Date('2024-01-20T08:15:00Z'),
    title: 'Sueño en el océano profundo',
    dream_description: 'Un sueño donde nadaba en las profundidades del océano con criaturas luminosas.',
    interpretation: 'El océano representa tu subconsciente profundo.',
    privacy: 'Privado' as DreamPrivacy,
    state: 'Archivado' as DreamState,
    emotion: 'Tristeza' as Emotion,
    type: 'Estandar' as DreamTypeName
};
