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

## Requisitos
- Node.js 18+
- Redis (opcional — há fallback em memória)