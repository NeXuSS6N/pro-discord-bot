import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN || '',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    publicKey: process.env.DISCORD_PUBLIC_KEY || '',
  },
  web: {
    baseUrl: process.env.WEB_BASE_URL || 'http://localhost:2949',
    port: Number(process.env.PORT || 3000),
    sessionSecret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
};


