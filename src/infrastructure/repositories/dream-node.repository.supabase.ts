import { DreamTypeName, IDreamNode } from "../../domain/models/dream-node.model";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { supabase } from "../../config/supabase";
import { IDreamNodeEntity } from "../entities/dream-node.entity";
import { privacyMap, stateMap, emotionMap, dreamTypeMap } from "../../config/mappings";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "../../domain/interfaces/pagination.interface";
import { IDreamContext } from "../../domain/interfaces/dream-context.interface";

export class DreamNodeRepositorySupabase implements IDreamNodeRepository {
  async save(
    dreamNode: IDreamNode,
    userId: string,
    dreamType: DreamTypeName
  ): Promise<{ data: any; error: Error | null }> {
    const dreamNodeEntity: IDreamNodeEntity = {
      ...(dreamNode.id ? { id: dreamNode.id } : {}),
      profile_id: userId,
      title: dreamNode.title,
      dream_description: dreamNode.dream_description,
      interpretation: dreamNode.interpretation,
      creation_date: dreamNode.creationDate,
      privacy_id: privacyMap[dreamNode.privacy]!,
      state_id: stateMap[dreamNode.state]!,
      emotion_id: emotionMap[dreamNode.emotion]!,
      image_url: dreamNode.imageUrl ?? '',
      dream_type_id: dreamTypeMap[dreamType]!,
    };
    const { data,  error  } = await supabase
      .from("dream_node")
      .insert(dreamNodeEntity)
      .select()
      .single();
    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
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
      dream_description: node.description,
      interpretation: node.interpretation,
      imageUrl: node.image_url,
      creationDate: new Date(node.creation_date),
      privacy: node.privacy,
      state: node.state,
      emotion: node.emotion,
      type: node.type,
      typeReason: node.type_reason,
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

   async getUserDreamContext(userId: string): Promise<IDreamContext> {
    const { data, error } = await supabase.rpc("get_user_context", {
      params: { user_id: userId },
    });

    if (error) {
      console.error("Error getting user context:", error);
      return {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
    }

    return data as IDreamContext;
  }

  async addDreamContext(
    dreamNodeId: string,
    userId: string,
    context: IDreamContext
  ) {
    const { themes, people, locations, emotions_context } = context;

    if (themes?.length) {
      for (const theme of themes) {
        const { data: existingTheme } = await supabase
          .from("profile_theme")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", theme.label)
          .single();

        const themeId =
          existingTheme?.id ??
          (
            await supabase
              .from("profile_theme")
              .insert({ profile_id: userId, label: theme.label })
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
      for (const person of people) {
        const { data: existingPerson } = await supabase
          .from("profile_person")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", person.label)
          .single();

        const personId =
          existingPerson?.id ??
          (
            await supabase
              .from("profile_person")
              .insert({ profile_id: userId, label: person.label })
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
      for (const location of locations) {
        const { data: existingLocation } = await supabase
          .from("profile_location")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", location.label)
          .single();

        const locationId =
          existingLocation?.id ??
          (
            await supabase
              .from("profile_location")
              .insert({ profile_id: userId, label: location.label })
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
      for (const emotion of emotions_context) {
        const { data: existingEmotion } = await supabase
          .from("profile_emotion_context")
          .select("id")
          .eq("profile_id", userId)
          .ilike("label", emotion.label)
          .single();

        const emotionId =
          existingEmotion?.id ??
          (
            await supabase
              .from("profile_emotion_context")
              .insert({ profile_id: userId, label: emotion.label })
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

  async updateDreamNode(
  nodeId: string,
  userId: string,
  updates: Partial<Pick<IDreamNode, 'state' | 'privacy'>>
): Promise<{ data: any; error: Error | null }> {
  try {
    const updateData: any = {};

    if (updates.state !== undefined) {
      updateData.state_id = stateMap[updates.state];
    }

    if (updates.privacy !== undefined) {
      updateData.privacy_id = privacyMap[updates.privacy];
    }

    if (Object.keys(updateData).length === 0) {
      return { data: null, error: new Error('No fields to update') };
    }

    const { data, error } = await supabase
      .from('dream_node')
      .update(updateData)
      .eq('id', nodeId)
      .eq('profile_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        state: Object.keys(stateMap).find(key => stateMap[key] === data.state_id),
        privacy: Object.keys(privacyMap).find(key => privacyMap[key] === data.privacy_id),
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
}
