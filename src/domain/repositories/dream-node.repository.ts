import { DreamNode } from "../models/dream-node.model";

export interface IDreamNodeRepository {
    save(dreamNode: DreamNode, userId: string): Promise<void>;
}