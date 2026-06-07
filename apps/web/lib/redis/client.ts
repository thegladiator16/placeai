import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error('REDIS_URL is not set');
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redis.on('error', (err: Error) => {
      console.error('[Redis] connection error:', err.message);
    });
  }
  return redis;
}

export async function withRedis<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
  const client = getRedis();
  return fn(client);
}
