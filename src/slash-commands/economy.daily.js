import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import dayjs from 'dayjs';
import ms from 'ms';
import { prisma } from '../lib/db.js';

const DEFAULT_DAILY = 250;
const COOLDOWN_MS = ms('20h');

export default {
  data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily reward'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const discordId = interaction.user.id;

    let user = await prisma.user.findUnique({ where: { discordId } });
    if (!user) user = await prisma.user.create({ data: { discordId, username: interaction.user.username } });
    let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) profile = await prisma.profile.create({ data: { userId: user.id } });
    let inv = await prisma.inventory.findFirst({ where: { userId: user.id } });
    if (!inv) inv = await prisma.inventory.create({ data: { userId: user.id } });

    const now = dayjs();
    const guildSettings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
    const DAILY_REWARD = guildSettings?.dailyRewardAmount ?? DEFAULT_DAILY;
    if (profile.lastDailyAt) {
      const last = dayjs(profile.lastDailyAt);
      const diff = now.diff(last);
      if (diff < COOLDOWN_MS) {
        const remaining = COOLDOWN_MS - diff;
        const embed = new EmbedBuilder()
          .setTitle('Daily already claimed')
          .setDescription(`Come back in ${ms(remaining, { long: true })}.`)
          .setColor(0xf59e0b);
        return interaction.editReply({ embeds: [embed] });
      }
    }

    const updated = await prisma.inventory.update({ where: { id: inv.id }, data: { gold: inv.gold + DAILY_REWARD } });
    await prisma.profile.update({ where: { id: profile.id }, data: { lastDailyAt: now.toDate() } });

    const embed = new EmbedBuilder()
      .setTitle('Daily Reward')
      .setDescription(`You received ${DAILY_REWARD} coins!`)
      .addFields({ name: 'Balance', value: `${updated.gold} coins` })
      .setColor(0x22c55e);
    return interaction.editReply({ embeds: [embed] });
  },
};


