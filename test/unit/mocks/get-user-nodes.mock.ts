import { IDreamNode } from '../../../src/domain/models/dream-node.model';
import { IPaginatedResult, IPaginationOptions } from '../../../src/domain/interfaces/pagination.interface';
import { IDreamNodeFilters } from '../../../src/domain/interfaces/dream-node-filters.interface';
import { dreamNodeMockTwo } from './dream-node.mock';

export const userId = '550e8400-e29b-41d4-a716-446655440001';

export const filters: IDreamNodeFilters = {
  state: 'Activo',
  privacy: 'Publico',
  emotion: 'Tristeza',
  search: 'oceano',
  from: '2024-01-01',
  to: '2024-12-31',
};

export const pagination: IPaginationOptions = { page: 2, limit: 5 };

export const paginatedResult: IPaginatedResult<IDreamNode> = {
  data: [dreamNodeMockTwo],
  pagination: {
    currentPage: 2,
    limit: 5,
    total: 15,
    totalPages: 3,
    hasNext: true,
    hasPrev: true,
  },
};
