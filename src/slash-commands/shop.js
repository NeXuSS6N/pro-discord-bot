import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { prisma } from '../lib/db.js';

export default {
  data: new SlashCommandBuilder().setName('shop').setDescription('List items available for purchase'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const items = await prisma.storeItem.findMany({ where: { guildId: interaction.guildId }, orderBy: { price: 'asc' } });
    const embed = new EmbedBuilder().setTitle('Shop').setColor(0x60a5fa);
    if (!items.length) embed.setDescription('No items yet. Ask an admin to add some in the dashboard.');
    else items.forEach((i) => embed.addFields({ name: `${i.emoji ? i.emoji + ' ' : ''}${i.name} — ${i.price} coins`, value: i.description || '\u200b' }));
    await interaction.editReply({ embeds: [embed] });
  },
};


