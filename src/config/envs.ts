import dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

export const envs = {
    PORT: get('PORT').default(3000).asPortNumber(),
    OPENAI_API_KEY: get('OPENAI_API_KEY').required().asString(),
    // Default base model used when no fine-tuned model is configured
    OPENAI_MODEL: get('OPENAI_MODEL').default('gpt-3.5-turbo').asString(),
    // Optional: your fine-tuned model id (e.g., ft:gpt-4o-mini:org:...)
    OPENAI_FINE_TUNED_MODEL: get('OPENAI_FINE_TUNED_MODEL').asString(),
    SUPABASE_URL: get('SUPABASE_URL').required().asString(),
    SUPABASE_KEY: get('SUPABASE_KEY').required().asString(),
    SUPABASE_JWT_SECRET: get('SUPABASE_JWT_SECRET').required().asString(),
    GEMINI_API_KEY: get('GEMINI_API_KEY').required().asString()
};