import RedisLib from "ioredis";
const Redis = RedisLib as unknown as typeof RedisLib.default;
type RedisClient = InstanceType<typeof Redis>;

const REDIS_URL = process.env.REDIS_URL;

let redis: RedisClient | null = null;

function getRedis(): RedisClient | null {
  if (!REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
    redis.on("error", (err: Error) => console.error("Redis error:", err.message));
  }
  return redis;
}

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function getCachedUrl(code: string): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    return await r.get(`link:${code}`);
  } catch {
    return null;
  }
}

export async function setCachedUrl(code: string, url: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(`link:${code}`, url, "EX", CACHE_TTL);
  } catch {
    // cache failures are non-fatal
  }
}
