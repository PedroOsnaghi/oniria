import { DreamTypeName, IDreamNode } from "../models/dream-node.model";
import { IDreamNodeFilters } from "../interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "../interfaces/pagination.interface";
import { IDreamContext } from "../interfaces/dream-context.interface";

export interface IDreamNodeRepository {
    save(dreamNode: IDreamNode, userId: string, dreamType: DreamTypeName): Promise<{ data: any; error: Error | null }>;
    getUserNodes(userId: string, filters: IDreamNodeFilters, pagination: IPaginationOptions): Promise<IDreamNode[]>;
    countUserNodes(userId: string, filters: IDreamNodeFilters): Promise<number>;
    addDreamContext(nodeId:string, userId: string, dreamContext : IDreamContext): Promise<void>;
    getUserDreamContext(userId: string): Promise<IDreamContext>;
    updateDreamNode(nodeId: string, userId: string, updates: Partial<Pick<IDreamNode, 'state' | 'privacy'>>): Promise<{ data: any | null; error: Error | null }>;
}