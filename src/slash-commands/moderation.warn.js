import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { prisma } from '../lib/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption((opt) => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await prisma.warning.create({
      data: {
        guildId: interaction.guildId,
        targetDiscordId: target.id,
        moderatorDiscordId: interaction.user.id,
        reason,
      },
    });
    const embed = new EmbedBuilder()
      .setTitle('User Warned')
      .setDescription(`${target.tag} has been warned.`)
      .addFields({ name: 'Reason', value: reason })
      .setColor(0xf59e0b);
    await interaction.reply({ embeds: [embed] });
  },
};


