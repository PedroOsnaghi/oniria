import { supabase } from "../../config/supabase";
import { IllustrationProvider } from "../../domain/providers/illustration.provider";

export class IllustrationDreamService {
  constructor(private illustrationProvider: IllustrationProvider) {}

  async generateIllustration(dreamText: string): Promise<string> {
    const buffer = await this.illustrationProvider.generateIllustration(
      dreamText
    );
    const fileName = `dream_${Date.now()}.png`;

    const { error } = await supabase.storage
      .from("dreams")
      .upload(`dreams/${fileName}`, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("dreams")
      .getPublicUrl(`dreams/${fileName}`);

    return publicUrlData.publicUrl;
  }
}
