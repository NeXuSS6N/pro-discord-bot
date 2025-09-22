import { prisma } from './db.js';

const cooldownCache = new Map(); // key: guildId:name:userId -> timestamp

export async function ensureCommandAllowed(interaction, commandName) {
  const guildId = interaction.guildId;
  if (!guildId) return { ok: true };
  const config = await prisma.commandConfig.findUnique({ where: { guildId_name: { guildId, name: commandName } } }).catch(() => null);
  if (!config || config.enabled) {
    // ok
  } else {
    return { ok: false, reason: 'Command disabled by server admins.' };
  }

  if (config?.requiredRoleId) {
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.roles.cache.has(config.requiredRoleId)) {
      return { ok: false, reason: 'You lack the required role to use this command.' };
    }
  }

  if (config?.channelId && interaction.channelId !== config.channelId) {
    return { ok: false, reason: 'This command can only be used in a specific channel.' };
  }

  if (config?.cooldownSeconds && config.cooldownSeconds > 0) {
    const key = `${guildId}:${commandName}:${interaction.user.id}`;
    const last = cooldownCache.get(key) || 0;
    const now = Date.now();
    const cdMs = config.cooldownSeconds * 1000;
    if (now - last < cdMs) {
      const remaining = Math.ceil((cdMs - (now - last)) / 1000);
      return { ok: false, reason: `Cooldown active. Try again in ${remaining}s.` };
    }
    cooldownCache.set(key, now);
  }

  return { ok: true };
}


