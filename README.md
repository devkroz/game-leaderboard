# 🏆 Game Leaderboard

Sistema de leaderboard para competições multiplayer com ranking em tempo real via **WebSocket**, sistema de **achievements** e perfil de jogador com estatísticas.

## Stack
- **Frontend:** React + TypeScript + Vite + Socket.io-client
- **Backend:** Node.js + Socket.io + Express
- **Persistência:** Redis (com fallback automático em memória para demo local)

## Funcionalidades
- Ranking em tempo real (Socket.io broadcast)
- Perfil do jogador (pontos, vitórias, partidas)
- Sistema de achievements desbloqueáveis
- Simulação de partidas ao vivo para demonstração
- Store em memória quando o Redis não está disponível

## Como rodar

### 1. Backend
```bash
cd server
npm install
npm run dev          # http://localhost:4000
```
> Sem Redis instalado? Roda normalmente com store em memória.
> Com Redis: `USE_REDIS=true redis-server`

### 2. Frontend
```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

## Deploy

### Backend (Render)
O repositório já contém `render.yaml` (blueprint). Basta:
1. Importar o repo `devkroz/game-leaderboard` no [Render](https://render.com)
2. Selecionar **Blueprint** → o serviço `game-leaderboard-server` é criado
3. Copiar a URL gerada (ex.: `https://game-leaderboard-server.onrender.com`)

### Frontend (Netlify)
O `netlify.toml` já aponta para `client/dist`. Defina a variável `VITE_API_URL` com a URL do backend acima.

## Requisitos
- Node.js 18+
- Redis (opcional — há fallback em memória)