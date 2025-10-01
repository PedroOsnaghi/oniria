import { DreamNode } from "../models/dream-node.model";
import { IDreamNodeFilters } from "../interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "../interfaces/pagination.interface";

export interface IDreamNodeRepository {
    save(dreamNode: DreamNode, userId: string): Promise<void>;
    getUserNodes(userId: string, filters: IDreamNodeFilters, pagination: IPaginationOptions): Promise<DreamNode[]>;
    countUserNodes(userId: string, filters: IDreamNodeFilters): Promise<number>;
}