import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { Store, createStore } from "./store";
import { Player, LeaderboardEntry } from "./types";
import { checkAchievements, achievementById } from "./achievements";

const PORT = Number(process.env.PORT || 4000);
const store: Store = createStore();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

async function snapshot(limit = 100): Promise<LeaderboardEntry[]> {
  const players = await store.getPlayers();
  return players.slice(0, limit).map((p, idx) => ({ ...p, rank: idx + 1 }));
}

async function emitBoard() {
  io.emit("leaderboard:update", await snapshot(20));
}

app.get("/api/leaderboard", async (_req, res) => {
  res.json(await snapshot(100));
});

app.get("/api/player/:id", async (req, res) => {
  const p = await store.getPlayer(req.params.id);
  if (!p) return res.status(404).json({ error: "Jogador não encontrado" });
  res.json(p);
});

app.get("/api/achievements", async (_req, res) => {
  const { ACHIEVEMENTS } = await import("./achievements");
  res.json(ACHIEVEMENTS);
});

app.get("/health", (_req, res) => res.json({ ok: true }));

async function hydrateAchievements(ids: string[]) {
  return ids.map(achievementById).filter(Boolean);
}

async function seed() {
  const players = await store.getPlayers();
  if (players.length > 0 || process.env.NODE_ENV === "production") return;
  const names = ["Kroz", "Sombra", "Zed", "Luna", "Rex", "Nyx", "Vox", "Mira", "Thorn", "Sky"];
  for (const name of names) {
    const wins = Math.floor(Math.random() * 8);
    const games = wins + Math.floor(Math.random() * 10);
    const score = Math.floor(Math.random() * 4000) + 100;
    await store.upsertPlayer({
      id: name,
      username: name,
      score,
      wins,
      games,
      achievements: checkAchievements({ score, wins, games }),
      lastActiveAt: Date.now(),
    } as Player);
  }
  await emitBoard();
}

// Simulated live game results for demo
function startSimulation() {
  if ((globalThis as any).__simStarted) return;
  (globalThis as any).__simStarted = true;
  setInterval(async () => {
    const players = await store.getPlayers();
    if (players.length === 0) return;
    const target = players[Math.floor(Math.random() * players.length)];
    const current = await store.getPlayer(target.id);
    if (!current) return;
    const win = Math.random() > 0.5;
    const gain = Math.floor(Math.random() * 400) + 20;
    const updated: Player = {
      ...current,
      score: current.score + gain,
      games: current.games + 1,
      wins: current.wins + (win ? 1 : 0),
      achievements: Array.from(
        new Set([
          ...current.achievements,
          ...checkAchievements({
            score: current.score + gain,
            wins: current.wins + (win ? 1 : 0),
            games: current.games + 1,
          }),
        ])
      ),
      lastActiveAt: Date.now(),
    };
    await store.upsertPlayer(updated);
    emitBoard();
  }, 4000);
}

io.on("connection", (socket) => {
  console.log("conectado:", socket.id);

  socket.on("leaderboard:get", async (cb) => {
    const board = await snapshot(20);
    if (typeof cb === "function") cb(board);
  });

  socket.on("player:join", async (payload, cb) => {
    const username = String(payload?.username || "Jogador").slice(0, 20);
    let player = await store.getPlayer(username);
    if (!player) {
      player = {
        id: username,
        username,
        score: 0,
        wins: 0,
        games: 0,
        achievements: [],
        lastActiveAt: Date.now(),
      };
      await store.upsertPlayer(player);
    }
    const achievements = await hydrateAchievements(player.achievements);
    socket.emit("player:init", { player, achievements });
    emitBoard();
    if (typeof cb === "function") cb({ player, achievements });
  });

  socket.on("score:submit", async (payload) => {
    const username = payload?.username;
    const scoreGain = Number(payload?.scoreGain || 0);
    if (!username || !scoreGain) return;
    const current = await store.getPlayer(username);
    if (!current) return;
    const wins = current.wins + (scoreGain >= 500 ? 1 : 0);
    const updated: Player = {
      ...current,
      score: current.score + scoreGain,
      games: current.games + 1,
      wins,
      achievements: Array.from(
        new Set([
          ...current.achievements,
          ...checkAchievements({ score: current.score + scoreGain, wins, games: current.games + 1 }),
        ])
      ),
      lastActiveAt: Date.now(),
    };
    await store.upsertPlayer(updated);
    const achievements = await hydrateAchievements(updated.achievements);
    socket.emit("score:ack", { score: updated.score, achievements });
    emitBoard();
  });
});

seed().then(() => startSimulation());

httpServer.listen(PORT, () => {
  console.log(`Game Leaderboard server rodando em http://localhost:${PORT}`);
});