import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'slash-commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  const slashDefs = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(pathToFileURL(filePath).href);
    const command = commandModule.default;
    if (!command?.data || !command?.execute) continue;
    client.commands.set(command.data.name, command);
    slashDefs.push(command.data.toJSON());
  }

  if (!config.discord.token || !config.discord.clientId) {
    console.warn('Skipping command registration: missing DISCORD_TOKEN or DISCORD_CLIENT_ID');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(config.discord.token);
  try {
    await rest.put(Routes.applicationCommands(config.discord.clientId), { body: slashDefs });
    console.log(`Loaded ${slashDefs.length} slash command(s).`);
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
}


