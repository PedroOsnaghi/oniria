import dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config();

export const envs = {
    PORT: get('PORT').default(3000).asPortNumber(),
    OPENAI_API_KEY: get('OPENAI_API_KEY').required().asString()
};