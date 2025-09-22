import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../lib/db.js';

export default {
  data: new SlashCommandBuilder().setName('balance').setDescription('Check your coin balance'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const discordId = interaction.user.id;
    let user = await prisma.user.findUnique({ where: { discordId } });
    if (!user) user = await prisma.user.create({ data: { discordId, username: interaction.user.username } });
    let inv = await prisma.inventory.findFirst({ where: { userId: user.id } });
    if (!inv) inv = await prisma.inventory.create({ data: { userId: user.id } });

    const embed = new EmbedBuilder()
      .setTitle('Balance')
      .setDescription(`You have ${inv.gold} coins.`)
      .setColor(0x38bdf8);
    return interaction.editReply({ embeds: [embed] });
  },
};


