import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../lib/db.js';

export default {
  data: new SlashCommandBuilder().setName('profile').setDescription('View your profile'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const discordId = interaction.user.id;

    let user = await prisma.user.findUnique({ where: { discordId } });
    if (!user) {
      user = await prisma.user.create({ data: { discordId, username: interaction.user.username } });
    }

    let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: user.id } });
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('Your Profile')
      .setColor(0x00c853)
      .addFields(
        { name: 'Level', value: String(profile.level), inline: true },
        { name: 'XP', value: String(profile.xp), inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};


