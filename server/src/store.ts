import Redis from "ioredis";
import { Player } from "./types";

export interface Store {
  upsertPlayer(p: Player): Promise<void>;
  getLeaderboard(limit: number): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  getPlayers(): Promise<Player[]>;
}

const KEY_LEADERBOARD = "lb:score";
const KEY_PLAYER = (id: string) => `lb:player:${id}`;

class RedisStore implements Store {
  private redis: Redis;
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    });
  }
  async upsertPlayer(p: Player): Promise<void> {
    await this.redis
      .pipeline()
      .zadd(KEY_LEADERBOARD, p.score, p.id)
      .set(KEY_PLAYER(p.id), JSON.stringify(p))
      .exec();
  }
  async getLeaderboard(limit: number): Promise<Player[]> {
    const ids = await this.redis.zrevrange(KEY_LEADERBOARD, 0, limit - 1);
    return this.hydrate(ids);
  }
  async getPlayer(id: string): Promise<Player | null> {
    const raw = await this.redis.get(KEY_PLAYER(id));
    return raw ? (JSON.parse(raw) as Player) : null;
  }
  async getPlayers(): Promise<Player[]> {
    const ids = await this.redis.zrevrange(KEY_LEADERBOARD, 0, -1);
    return this.hydrate(ids);
  }
  private async hydrate(ids: string[]): Promise<Player[]> {
    if (ids.length === 0) return [];
    const values = await this.redis.mget(ids.map(KEY_PLAYER));
    return ids
      .map((id, i) => (values[i] ? JSON.parse(values[i]) : null))
      .filter((p): p is Player => p !== null);
  }
}

class MemoryStore implements Store {
  private players = new Map<string, Player>();

  async upsertPlayer(p: Player): Promise<void> {
    this.players.set(p.id, p);
  }
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values()).sort((a, b) => b.score - a.score);
  }
  async getLeaderboard(limit: number): Promise<Player[]> {
    return (await this.getPlayers()).slice(0, limit);
  }
  async getPlayer(id: string): Promise<Player | null> {
    return this.players.get(id) || null;
  }
}

export function createStore(): Store {
  if (process.env.USE_REDIS === "true") {
    try {
      const probe = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT || 6379),
        maxRetriesPerRequest: null,
        connectTimeout: 1500,
      });
      // wait for connect once to confirm availability
      return new RedisStore();
    } catch {
      console.warn("[store] Redis indisponível, usando fallback em memória.");
      return new MemoryStore();
    }
  }
  console.warn("[store] USE_REDIS não definido — usando store em memória.");
  return new MemoryStore();
}