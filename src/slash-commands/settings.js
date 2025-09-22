import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../lib/db.js';
import { successEmbed } from '../lib/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Update guild settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName('locale').setDescription('Locale code (en/fr)').setRequired(false))
    .addChannelOption((o) => o.setName('welcome_channel').setDescription('Welcome channel').setRequired(false))
    .addChannelOption((o) => o.setName('log_channel').setDescription('Log channel').setRequired(false))
    .addBooleanOption((o) => o.setName('welcome_enabled').setDescription('Enable welcome messages'))
    .addBooleanOption((o) => o.setName('economy_enabled').setDescription('Enable economy'))
    .addBooleanOption((o) => o.setName('moderation_enabled').setDescription('Enable moderation')),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guildId = interaction.guildId;
    const data = {};
    const locale = interaction.options.getString('locale');
    const welcomeChannel = interaction.options.getChannel('welcome_channel');
    const logChannel = interaction.options.getChannel('log_channel');
    const welcomeEnabled = interaction.options.getBoolean('welcome_enabled');
    const economyEnabled = interaction.options.getBoolean('economy_enabled');
    const moderationEnabled = interaction.options.getBoolean('moderation_enabled');

    if (locale) data.locale = locale;
    if (welcomeChannel) data.welcomeChannelId = welcomeChannel.id;
    if (logChannel) data.logChannelId = logChannel.id;
    if (welcomeEnabled !== null) data.welcomeEnabled = welcomeEnabled;
    if (economyEnabled !== null) data.economyEnabled = economyEnabled;
    if (moderationEnabled !== null) data.moderationEnabled = moderationEnabled;

    const existing = await prisma.guildSettings.findUnique({ where: { guildId } });
    if (existing) await prisma.guildSettings.update({ where: { id: existing.id }, data });
    else await prisma.guildSettings.create({ data: { guildId, ...data } });

    await interaction.editReply({ embeds: [successEmbed('Settings updated', 'Your changes were saved.')] });
  },
};


