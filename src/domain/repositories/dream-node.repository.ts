import { IDreamNode } from "../models/dream-node.model";
import { IDreamNodeFilters } from "../interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "../interfaces/pagination.interface";
import { IDreamContext } from "../interfaces/dream-context.interface";
import { DreamType } from "../models/dream_type.model";

export interface IDreamNodeRepository {

    save(dreamNode: IDreamNode, userId: string, dreamType: DreamType): Promise<{ data: any; error: Error | null }>;
    getUserNodes(userId: string, filters: IDreamNodeFilters, pagination: IPaginationOptions): Promise<IDreamNode[]>;
    countUserNodes(userId: string, filters: IDreamNodeFilters): Promise<number>;
    addDreamContext(nodeId:string, userId: string, dreamContext : IDreamContext): Promise<void>;
    getUserDreamContext(userId: string): Promise<IDreamContext>;
}