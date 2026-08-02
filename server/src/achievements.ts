import { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_win", name: "Primeira Vitória", description: "Venceu seu primeiro jogo", icon: "🏆" },
  { id: "score_1000", name: "Mil Pontos", description: "Acumulou 1.000 pontos", icon: "💯" },
  { id: "score_5000", name: "Lendário", description: "Acumulou 5.000 pontos", icon: "🌟" },
  { id: "games_10", name: "Veterano", description: "Jogou 10 partidas", icon: "🎮" },
  { id: "win_streak", name: "Em Chamas", description: "Venceu 3 partidas seguidas", icon: "🔥" },
  { id: "top_10", name: "Top 10", description: "Alcançou o top 10 do ranking", icon: "🏅" },
];

export const checkAchievements = (player: {
  score: number;
  wins: number;
  games: number;
}): string[] => {
  const earned: string[] = [];
  if (player.wins > 0) earned.push("first_win");
  if (player.score >= 1000) earned.push("score_1000");
  if (player.score >= 5000) earned.push("score_5000");
  if (player.games >= 10) earned.push("games_10");
  if (player.wins >= 3) earned.push("rank_streak");
  return earned;
};
export const achievementById = (id: string): Achievement | undefined =>
  ACHIEVEMENTS.find((a) => a.id === id);