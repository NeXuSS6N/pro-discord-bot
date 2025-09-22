import { SlashCommandBuilder } from 'discord.js';
import { prisma } from '../lib/db.js';
import { successEmbed } from '../lib/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption((o) => o.setName('item').setDescription('Item name').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const name = interaction.options.getString('item', true);
    const item = await prisma.storeItem.findUnique({ where: { guildId_name: { guildId: interaction.guildId, name } } });
    if (!item) return interaction.editReply({ content: 'Item not found.' });

    let user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
    if (!user) user = await prisma.user.create({ data: { discordId: interaction.user.id, username: interaction.user.username } });
    let inv = await prisma.inventory.findFirst({ where: { userId: user.id } });
    if (!inv) inv = await prisma.inventory.create({ data: { userId: user.id } });
    if (inv.gold < item.price) return interaction.editReply({ content: 'Not enough coins.' });

    await prisma.inventory.update({ where: { id: inv.id }, data: { gold: inv.gold - item.price } });
    const items = Array.isArray(inv.items) ? inv.items : [];
    items.push({ name: item.name, at: Date.now() });
    await prisma.inventory.update({ where: { id: inv.id }, data: { items } });

    await interaction.editReply({ embeds: [successEmbed('Purchased', `You bought ${item.emoji ? item.emoji + ' ' : ''}${item.name} for ${item.price} coins.`)] });
  },
};


