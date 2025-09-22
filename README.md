# Pro Discord Bot (JS)

Modern Discord bot with a web dashboard using discord.js, Express, and Prisma (SQLite by default).

## Setup

1. Copy `.env.example` to `.env` and fill values:

```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_app_id
DISCORD_CLIENT_SECRET=your_client_secret
WEB_BASE_URL=http://localhost:3000
PORT=3000
SESSION_SECRET=change_me
DATABASE_URL="file:./dev.db"
```

2. Deploy slash commands:

```
npm run deploy:commands
```

3. Start bot and web dashboard:

```
npm run dev
```

Open http://localhost:3000 to access the dashboard.

## Features

- Slash commands with embeds: `/ping`, `/help`, `/profile`, `/daily`, `/balance`, `/level`, `/kick`, `/userinfo`
- OAuth2 login, simple dashboard with guild list
- Prisma ORM models for users, guilds, profiles, inventories
- Skeleton for moderation, economy, leveling


