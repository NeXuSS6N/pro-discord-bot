import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { loadCommands } from './lib/loader.js';
import { registerEventHandlers } from './lib/events.js';
import { startWebServer } from './web/server.js';

export const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.User],
});

botClient.commands = new Collection();

await loadCommands(botClient);
registerEventHandlers(botClient);

botClient.login(config.discord.token).catch((err) => {
  console.error('Failed to login:', err);
  process.exit(1);
});

startWebServer(botClient).catch((err) => {
  console.error('Failed to start web server:', err);
  process.exit(1);
});


