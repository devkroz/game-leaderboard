import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Achievement, LeaderboardEntry, Player } from "./types";
import { ACHIEVEMENT_META } from "./achievements";

export default function App() {
  const socketRef = useRef<Socket | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scoreGain, setScoreGain] = useState(100);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("leaderboard:update", (data: LeaderboardEntry[]) => setBoard(data));
    socket.on("player:init", ({ player, achievements }) => {
      setPlayer(player);
      setAchievements(achievements);
      setJoined(true);
    });
    socket.on("score:ack", ({ score }) => {
      setPlayer((p) => (p ? { ...p, score } : p));
      setToast(`Pontos atualizados: +${scoreGain}`);
      setTimeout(() => setToast(null), 2500);
    });

    socket.emit("leaderboard:get", (data: LeaderboardEntry[]) => setBoard(data));

    return () => {
      socket.disconnect();
    };
  }, []);

  const join = () => {
    const name = username.trim() || "Jogador";
    socketRef.current?.emit("player:join", { username: name });
  };

  const submitScore = (gain: number) => {
    setScoreGain(gain);
    socketRef.current?.emit("score:submit", {
      username: player?.username,
      scoreGain: gain,
    });
  };

  const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="glow">🏆</span> Game Leaderboard
        </h1>
        <p className="tagline">Ranking em tempo real via WebSocket</p>
      </header>

      {!joined ? (
        <section className="join-card">
          <h2>Entre na partida</h2>
          <p>Escolha um nome de jogador para acompanhar seu desempenho.</p>
          <div className="join-row">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de jogador"
              onKeyDown={(e) => e.key === "Enter" && join()}
            />
            <button onClick={join} className="btn primary">
              Jogar
            </button>
          </div>
        </section>
      ) : (
        <section className="player-card">
          <div className="player-info">
            <div className="avatar">{player?.username.slice(0, 2).toUpperCase()}</div>
            <div>
              <h3>{player?.username}</h3>
              <p>
                Pontos: <strong>{player?.score}</strong> · Vitórias: {player?.wins} · Partidas:{" "}
                {player?.games}
              </p>
            </div>
          </div>
          <div className="actions">
            <button className="btn small" onClick={() => submitScore(50)}>
              +50 pontos
            </button>
            <button className="btn small" onClick={() => submitScore(150)}>
              +150 pontos
            </button>
            <button className="btn small win" onClick={() => submitScore(600)}>
              🎉 Vitória +600
            </button>
          </div>
        </section>
      )}

      {toast && <div className="toast">{toast}</div>}

      <main className="board-wrap">
        <section className="board">
          <h2>Top Jogadores</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Jogador</th>
                <th>Pontos</th>
                <th>Vitórias</th>
                <th>Partidas</th>
              </tr>
            </thead>
            <tbody>
              {board.map((e, i) => (
                <tr key={e.id} className={player?.username === e.username ? "me" : ""}>
                  <td className="rank"><span className="medal" style={{ color: e.rank === 1 ? "#ffd700" : e.rank === 2 ? "#c0c0c0" : e.rank === 3 ? "#cd7f32" : "#71717a" }}>{medal(e.rank)}</span></td>
                  <td>{e.username}</td>
                  <td className="score">{e.score.toLocaleString()}</td>
                  <td>{e.wins}</td>
                  <td>{e.games}</td>
                </tr>
              ))}
              {board.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    Aguardando jogadores...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="side">
          <section className="panel achievements">
            <h3>🎖️ Conquistas</h3>
            <p className="muted">Seu progresso</p>
            <ul>
              {Object.values(ACHIEVEMENT_META).map((a) => {
                const unlocked = achievements.some((x) => x.id === a.id);
                return (
                  <li key={a.id} className={unlocked ? "unlocked" : "locked"}>
                    <span className="icon">{unlocked ? a.icon : "🔒"}</span>
                    <div>
                      <strong>{a.name}</strong>
                      <p>{a.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!joined && <p className="hint">Faça login para ver suas conquistas</p>}
          </section>
        </aside>
      </main>

      <footer className="foot">
        Live demo · React + Socket.io + Redis + TypeScript
      </footer>
    </div>
  );
}