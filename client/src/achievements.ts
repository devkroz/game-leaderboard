export interface AchievementMeta {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const ACHIEVEMENT_META: AchievementMeta[] = [
  { id: "first_win", name: "Primeira Vitória", icon: "🏆", desc: "Venceu seu primeiro jogo" },
  { id: "score_1000", name: "Mil Pontos", icon: "💯", desc: "Acumulou 1.000 pontos" },
  { id: "score_5000", name: "Lendário", icon: "🌟", desc: "Acumulou 5.000 pontos" },
  { id: "games_10", name: "Veterano", icon: "🎮", desc: "Jogou 10 partidas" },
  { id: "rank_streak", name: "Em Chamas", icon: "🔥", desc: "Venceu 3 partidas" },
  { id: "top_10", name: "Top 10", icon: "🏅", desc: "Entrou no Top 10" },
];