import { Events, EmbedBuilder } from 'discord.js';
import { prisma } from './db.js';
import { maybeAwardXp } from './xp.js';
import { ensureCommandAllowed } from './command-guard.js';
import { sendWelcomeIfAny, sendLog } from './guild-utils.js';

export function registerEventHandlers(client) {
  client.once(Events.ClientReady, async (c) => {
    console.log(`Logged in as ${c.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      const allowed = await ensureCommandAllowed(interaction, interaction.commandName);
      if (!allowed.ok) return interaction.reply({ content: allowed.reason, ephemeral: true });
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const errEmbed = new EmbedBuilder()
        .setTitle('An error occurred')
        .setDescription('Something went wrong while executing this command.')
        .setColor(0xff4d4f);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errEmbed] });
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (!message.inGuild() || message.author.bot) return;
    try {
      await maybeAwardXp(message.author.id);
    } catch (e) {
      // ignore xp errors
    }
  });

  client.on(Events.GuildCreate, async (guild) => {
    try {
      const existing = await prisma.guild.findUnique({ where: { guildId: guild.id } });
      if (existing) {
        await prisma.guild.update({ where: { id: existing.id }, data: { name: guild.name, icon: guild.icon } });
      } else {
        await prisma.guild.create({ data: { guildId: guild.id, name: guild.name, icon: guild.icon } });
        await prisma.guildSettings.create({ data: { guildId: guild.id } });
      }
    } catch (e) {
      console.error('Failed to upsert guild:', e);
    }
  });

  client.on(Events.GuildDelete, async (guild) => {
    try {
      const existing = await prisma.guild.findUnique({ where: { guildId: guild.id } });
      if (existing) {
        await prisma.guild.delete({ where: { id: existing.id } });
      }
    } catch (e) {
      console.error('Failed to delete guild:', e);
    }
  });

  client.on(Events.GuildMemberAdd, async (member) => {
    await sendWelcomeIfAny(member.guild, member);
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    await sendLog(member.guild, 'Member Left', `${member.user.tag} (${member.id}) left the server.`, 0xef4444);
  });
}


