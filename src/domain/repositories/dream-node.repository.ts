import { IDreamNode } from "../models/dream-node.model";
import { IDreamNodeFilters } from "../interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "../interfaces/pagination.interface";
import { IDreamContext } from "../interfaces/dream-context.interface";

export interface IDreamNodeRepository {
    save(dreamNode: IDreamNode, userId: string): Promise<IDreamNode | undefined>;
    getUserNodes(userId: string, filters: IDreamNodeFilters, pagination: IPaginationOptions): Promise<IDreamNode[]>;
    countUserNodes(userId: string, filters: IDreamNodeFilters): Promise<number>;
    addDreamContext(nodeId:string, userId: string, dreamContext : IDreamContext): Promise<void>;
    getUserDreamContext(userId: string): Promise<IDreamContext>;
}