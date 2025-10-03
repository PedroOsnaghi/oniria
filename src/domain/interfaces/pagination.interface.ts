export interface IPaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface IPaginationMeta {
    currentPage: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface IPaginatedResult<T> {
    data: T[];
    pagination: IPaginationMeta;
}
