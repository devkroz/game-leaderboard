export interface Player {
  id: string;
  username: string;
  score: number;
  wins: number;
  games: number;
  achievements: string[];
  lastActiveAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LeaderboardEntry extends Player {
  rank: number;
}