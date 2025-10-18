import { IDreamNode } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { supabase } from "../../config/supabase";
import { IDreamNodeEntity } from "../entities/dream-node.entity";
import { privacyMap, stateMap, emotionMap } from "../../config/mappings";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "../../domain/interfaces/pagination.interface";
import { IDreamContext } from "../../domain/interfaces/dream-context.interface";

export class DreamNodeRepositorySupabase implements IDreamNodeRepository {
  async save(
    dreamNode: IDreamNode,
    userId: string
  ): Promise<IDreamNode | undefined> {
    const dreamNodeEntity: IDreamNodeEntity = {
      ...(dreamNode.id ? { id: dreamNode.id } : {}),
      profile_id: userId,
      title: dreamNode.title,
      description: dreamNode.description,
      interpretation: dreamNode.interpretation,
      creation_date: dreamNode.creationDate,
      privacy_id: privacyMap[dreamNode.privacy]!,
      state_id: stateMap[dreamNode.state]!,
      emotion_id: emotionMap[dreamNode.emotion]!,
    };
    const { data, error } = await supabase
      .from("dream_node")
      .insert(dreamNodeEntity)
      .select()
      .single();
    if (data) return data;
    if (error) {
      throw new Error(error!.message);
    }
  }

  async getUserNodes(
    userId: string,
    filters?: IDreamNodeFilters,
    pagination?: IPaginationOptions
  ): Promise<IDreamNode[]> {
    let query = supabase
      .from("dream_node")
      .select("*")
      .eq("profile_id", userId);

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

    if (filters?.search && filters.search.trim() !== "") {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm}`);
    }

    if (filters?.from) {
      query = query.gte("creation_date", filters.from);
    }

    if (filters?.to) {
      query = query.lte("creation_date", filters.to);
    }

    query = query.order("creation_date", { ascending: false });

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
      emotion: node.emotion,
    }));

    return dreamNodes;
  }

  async countUserNodes(
    userId: string,
    filters?: IDreamNodeFilters
  ): Promise<number> {
    let query = supabase
      .from("dream_node")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId);

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

    if (filters?.search && filters.search.trim() !== "") {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${searchTerm}`);
    }

    if (filters?.from) {
      query = query.gte("creation_date", filters.from);
    }

    if (filters?.to) {
      query = query.lte("creation_date", filters.to);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  }

  async addDreamContext(
    dreamNodeId: string,
    userId: string,
    context: IDreamContext
  ) {
    const { themes, people, locations, emotions_context } = context;

    if (themes?.length) {
      for (const label of themes) {
        const { data: existingTheme } = await supabase
          .from("profile_theme")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", label)
          .single();

        const themeId =
          existingTheme?.id ??
          (
            await supabase
              .from("profile_theme")
              .insert({ profile_id: userId, label })
              .select("id")
              .single()
          ).data?.id;

        if (!themeId) throw new Error("No se pudo obtener el ID del theme");

        await supabase
          .from("dream_theme")
          .insert({
            dream_id: dreamNodeId,
            theme_id: themeId,
          })
          .throwOnError();
      }
    }

    if (people?.length) {
      for (const label of people) {
        const { data: existingPerson } = await supabase
          .from("profile_person")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", label)
          .single();

        const personId =
          existingPerson?.id ??
          (
            await supabase
              .from("profile_person")
              .insert({ profile_id: userId, label })
              .select("id")
              .single()
          ).data?.id;

        if (!personId) throw new Error("No se pudo obtener el ID del person");

        await supabase
          .from("dream_person")
          .insert({
            dream_id: dreamNodeId,
            person_id: personId,
          })
          .throwOnError();
      }
    }

    if (locations?.length) {
      for (const label of locations) {
        const { data: existingLocation } = await supabase
          .from("profile_location")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", label)
          .single();

        const locationId =
          existingLocation?.id ??
          (
            await supabase
              .from("profile_location")
              .insert({ profile_id: userId, label })
              .select("id")
              .single()
          ).data?.id;

        if (!locationId)
          throw new Error("No se pudo obtener el ID del location");

        await supabase
          .from("dream_location")
          .insert({
            dream_id: dreamNodeId,
            location_id: locationId,
          })
          .throwOnError();
      }
    }

    if (emotions_context?.length) {
      for (const label of emotions_context) {
        const { data: existingEmotion } = await supabase
          .from("profile_emotion_context")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", label)
          .single();

        const emotionId =
          existingEmotion?.id ??
          (
            await supabase
              .from("profile_emotion_context")
              .insert({ profile_id: userId, label })
              .select("id")
              .single()
          ).data?.id;

        if (!emotionId) throw new Error("No se pudo obtener el ID del emotion");

        await supabase
          .from("dream_emotion_context")
          .insert({
            dream_id: dreamNodeId,
            emotion_context_id: emotionId,
          })
          .throwOnError();
      }
    }
  }
}
