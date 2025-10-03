export interface IDreamNodeFilters {
    state?: string;
    privacy?: string;
    emotion?: string;
    search?: string;
    from?: string;  // Fecha desde (formato ISO string)
    to?: string;    // Fecha hasta (formato ISO string)
}