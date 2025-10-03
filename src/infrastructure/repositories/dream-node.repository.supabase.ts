import { DreamNode } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { supabase } from '../../config/supabase';
import { IDreamNodeEntity } from "../entities/dream-node.entity";
import { privacyMap, stateMap, emotionMap } from "../../config/mappings";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import { IPaginationOptions} from "../../domain/interfaces/pagination.interface";

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

    async getUserNodes(userId: string, filters?: IDreamNodeFilters, pagination?: IPaginationOptions): Promise<DreamNode[]> {
        let query = supabase.from("dream_node").select("*").eq("profile_id", userId);

        if (filters?.state) {
            const stateId = stateMap[filters.state];
            if (stateId) query = query.eq("state_id", stateId);
        }

        if (filters?.privacy) {
            const privacyId = privacyMap[filters.privacy];
            if (privacyId) query = query.eq("privacy_id", privacyId);
        }

        if (filters?.emotion) {
            const emotionId = emotionMap[filters.emotion];
            if (emotionId) query = query.eq("emotion_id", emotionId);
        }

        if (filters?.search && filters.search.trim() !== '') {
            const searchTerm = `%${filters.search.trim()}%`;
            query = query.or(`title.ilike.${searchTerm}`);
        }

        if (filters?.from) {
            query = query.gte('creation_date', filters.from);
        }

        if (filters?.to) {
            query = query.lte('creation_date', filters.to);
        }

        query = query.order('creation_date', { ascending: false });

        if (pagination?.offset !== undefined && pagination?.limit !== undefined) {
            const to = pagination.offset + pagination.limit - 1;
            query = query.range(pagination.offset, to);
        }

        const { data, error } = await query;
        if (error) {
            throw new Error(error.message);
        }

        const dreamNodes = data.map((node: any) => ({
            id: node.id,
            title: node.title,
            description: node.description,
            interpretation: node.interpretation,
            creationDate: new Date(node.creation_date),
            privacy: node.privacy,
            state: node.state,
            emotion: node.emotion
        }));

        return dreamNodes;
    }

    async countUserNodes(userId: string, filters?: IDreamNodeFilters): Promise<number> {
        let query = supabase.from("dream_node").select("*", { count: 'exact', head: true }).eq("profile_id", userId);

        // Aplicar los mismos filtros que en getUserNodes
        if (filters?.state) {
            const stateId = stateMap[filters.state];
            if (stateId) query = query.eq("state_id", stateId);
        }

        if (filters?.privacy) {
            const privacyId = privacyMap[filters.privacy];
            if (privacyId) query = query.eq("privacy_id", privacyId);
        }

        if (filters?.emotion) {
            const emotionId = emotionMap[filters.emotion];
            if (emotionId) query = query.eq("emotion_id", emotionId);
        }

        if (filters?.search && filters.search.trim() !== '') {
            const searchTerm = `%${filters.search.trim()}%`;
            query = query.or(`title.ilike.${searchTerm}`);
        }

        if (filters?.from) {
            query = query.gte('creation_date', filters.from);
        }

        if (filters?.to) {
            query = query.lte('creation_date', filters.to);
        }

        const { count, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        return count || 0;
    }

}