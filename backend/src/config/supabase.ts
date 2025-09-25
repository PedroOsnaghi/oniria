import { createClient } from "@supabase/supabase-js";
import { envs } from "./envs";


const supabaseUrl = envs.SUPABASE_URL!;
const supabaseKey = envs.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
