import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../lib/db.js';
import { getProgress, buildProgressBar } from '../lib/leveling.js';

export default {
  data: new SlashCommandBuilder().setName('level').setDescription('Show your level progress'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const discordId = interaction.user.id;
    let user = await prisma.user.findUnique({ where: { discordId } });
    if (!user) user = await prisma.user.create({ data: { discordId, username: interaction.user.username } });
    let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) profile = await prisma.profile.create({ data: { userId: user.id } });

    const progress = getProgress(profile.xp);
    const embed = new EmbedBuilder()
      .setTitle('Level Progress')
      .setColor(0x00bcd4)
      .addFields(
        { name: 'Level', value: String(progress.level), inline: true },
        { name: 'XP', value: `${profile.xp}/${progress.nextLevelXp}`, inline: true },
        { name: 'Progress', value: buildProgressBar(progress.percent) }
      );

    await interaction.editReply({ embeds: [embed] });
  },
};


