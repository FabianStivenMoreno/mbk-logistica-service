import Redis from 'ioredis';

// Crear instancia de Redis
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379, // Puerto por defecto de Redis
});

// Función para guardar estado en Redis
export async function guardarEstadoEnRedis(envioId: number, estado: string): Promise<void> {
    await redis.set(`envio:${envioId}:estado`, estado, 'EX', 3600); // Expira en 1 hora la data en caché
}

// Función para obtener estado desde Redis
export async function obtenerEstadoDesdeRedis(envioId: number): Promise<string | null> {
    return await redis.get(`envio:${envioId}:estado`);
}

// Exportar Redis para reutilización
export default redis;