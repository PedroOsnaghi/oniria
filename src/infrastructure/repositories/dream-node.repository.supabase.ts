import { DreamNode } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { supabase } from '../../config/supabase';
import { IDreamNodeEntity } from "../entities/dream-node.entity";
import { privacyMap, stateMap, emotionMap } from "../../config/mappings";

export class DreamNodeRepositorySupabase implements IDreamNodeRepository {
    async save(dreamNode: DreamNode, userId: string): Promise<void> {
        const dreamNodeEntity : IDreamNodeEntity = {
            id: dreamNode.id,
            profile_id: userId,
            title: dreamNode.title,
            description: dreamNode.description,
            interpretation: dreamNode.interpretation,
            creation_date: dreamNode.creationDate,
            privacy_id: privacyMap[dreamNode.privacy] || 2,
            state_id: stateMap[dreamNode.state] || 1,
            emotion_id: emotionMap[dreamNode.emotion] || 1,
        };
        const {error} = await supabase
            .from('dream_node')
            .insert(dreamNodeEntity)
            .select()
            .single();
        if (error) {
            throw new Error(error.message);
        }
    }

}