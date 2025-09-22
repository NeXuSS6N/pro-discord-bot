import { SlashCommandBuilder } from 'discord.js';
import dayjs from 'dayjs';
import ms from 'ms';
import { prisma } from '../lib/db.js';
import { successEmbed } from '../lib/embeds.js';

const WORK_COOLDOWN = ms('1h');

export default {
  data: new SlashCommandBuilder().setName('work').setDescription('Work to earn coins'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const discordId = interaction.user.id;
    const user = await prisma.user.upsert({
      where: { discordId },
      update: { username: interaction.user.username },
      create: { discordId, username: interaction.user.username },
    });
    let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) profile = await prisma.profile.create({ data: { userId: user.id } });
    let inv = await prisma.inventory.findFirst({ where: { userId: user.id } });
    if (!inv) inv = await prisma.inventory.create({ data: { userId: user.id } });

    if (profile.lastWorkAt) {
      const diff = dayjs().diff(profile.lastWorkAt);
      if (diff < WORK_COOLDOWN) {
        const remaining = WORK_COOLDOWN - diff;
        return interaction.editReply({ content: `You are tired. Try again in ${ms(remaining, { long: true })}.` });
      }
    }

    const amount = Math.floor(Math.random() * 150) + 50;
    await prisma.inventory.update({ where: { id: inv.id }, data: { gold: inv.gold + amount } });
    await prisma.profile.update({ where: { id: profile.id }, data: { lastWorkAt: new Date() } });

    return interaction.editReply({ embeds: [successEmbed('Work', `You earned ${amount} coins.`)] });
  },
};


