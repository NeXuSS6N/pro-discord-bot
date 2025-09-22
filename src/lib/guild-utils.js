import { EmbedBuilder, ChannelType } from 'discord.js';
import { prisma } from './db.js';

export async function sendWelcomeIfAny(guild, member) {
  try {
    const settings = await prisma.guildSettings.findUnique({ where: { guildId: guild.id } });
    if (!settings?.welcomeEnabled || !settings?.welcomeChannelId) return;
    const channel = guild.channels.cache.get(settings.welcomeChannelId);
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const message = (settings.welcomeMessage || 'Welcome {user} to {guild}!')
      .replace('{user}', `<@${member.id}>`)
      .replace('{guild}', guild.name);
    const embed = new EmbedBuilder().setColor(0x22c55e).setDescription(message).setTimestamp();
    await channel.send({ embeds: [embed] });
  } catch {
    // ignore
  }
}

export async function sendLog(guild, title, description, color = 0x64748b) {
  try {
    const settings = await prisma.guildSettings.findUnique({ where: { guildId: guild.id } });
    if (!settings?.logChannelId) return;
    const channel = guild.channels.cache.get(settings.logChannelId);
    if (!channel || channel.type !== ChannelType.GuildText) return;
    const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();
    await channel.send({ embeds: [embed] });
  } catch {
    // ignore
  }
}


