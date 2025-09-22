import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .addUserOption((opt) => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption((opt) => opt.setName('reason').setDescription('Reason'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!member) return interaction.reply({ content: 'User not found.', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
    await member.kick(reason);
    const embed = new EmbedBuilder()
      .setTitle('Member Kicked')
      .setDescription(`${member.user.tag} was kicked.`)
      .addFields({ name: 'Reason', value: reason })
      .setColor(0xffa000);
    await interaction.reply({ embeds: [embed] });
  },
};


