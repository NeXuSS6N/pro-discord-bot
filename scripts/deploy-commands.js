import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const commands = [];
  const commandsDir = path.join(__dirname, '..', 'src', 'slash-commands');
  const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const cmd = (await import(pathToFileURL(path.join(commandsDir, file)).href)).default;
    if (cmd?.data) commands.push(cmd.data.toJSON());
  }

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token || !clientId) throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID');

  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`Deployed ${commands.length} command(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


