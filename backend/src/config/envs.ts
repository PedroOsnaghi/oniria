import dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config();

export const envs = {
    PORT: get('PORT').default(3000).asInt(),
    // Acá también van las credenciales de la base de datos y claves privadas
};