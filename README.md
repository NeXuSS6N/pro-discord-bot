# 🚀 Pro Discord Bot

_A modern, full-stack Discord bot with an integrated web dashboard._

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-14-blue?logo=discord&logoColor=white)](https://discord.js.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

> Built with **discord.js**, **Express**, and **Prisma** (SQLite by default).

---

## 📦 Quick Start

### 1️⃣ Install & Configure

Clone the repository and create your environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_app_id
DISCORD_CLIENT_SECRET=your_client_secret
WEB_BASE_URL=http://localhost:3000
PORT=3000
SESSION_SECRET=change_me
DATABASE_URL="file:./dev.db"
```

### 2️⃣ Deploy Slash Commands

```bash
npm run deploy:commands
```

### 3️⃣ Run the Bot & Dashboard

```bash
npm run dev
```

Then open 👉 [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features

- **Modern slash commands** with rich embeds  
  (`/ping`, `/help`, `/profile`, `/daily`, `/balance`, `/level`, `/kick`, `/userinfo`)
- **OAuth2 login & web dashboard** with guild selection
- **Prisma ORM** data models for users, guilds, profiles, and inventories
- Pre-built skeleton for **moderation**, **economy**, and **leveling**

---

## 🗂️ Tech Stack

| Layer      | Technology                        |
|------------|------------------------------------|
| Bot        | [discord.js](https://discord.js.org/) |
| Web server | [Express](https://expressjs.com/)     |
| Database   | [Prisma](https://www.prisma.io/) + SQLite (default) |

---

## 💡 Next Steps

- Add real-time stats or graphs to the dashboard  
- Integrate more moderation and economy modules  
- Deploy to production (e.g., Docker, Railway, or your own VPS)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).  
Feel free to fork, adapt, and build upon it.
