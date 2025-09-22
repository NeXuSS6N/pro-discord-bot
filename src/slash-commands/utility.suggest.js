import { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { prisma } from '../lib/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Post a server suggestion')
    .addStringOption((opt) => opt.setName('content').setDescription('Your suggestion').setRequired(true)),
  async execute(interaction) {
    const content = interaction.options.getString('content', true);
    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: 'Suggestions must be used in a text channel.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('Suggestion')
      .setDescription(content)
      .setFooter({ text: `By ${interaction.user.tag}` })
      .setColor(0x60a5fa);
    const msg = await channel.send({ embeds: [embed] });
    await msg.react('👍');
    await msg.react('👎');
    await prisma.suggestion.create({
      data: {
        guildId: interaction.guildId,
        authorDiscordId: interaction.user.id,
        content,
        messageId: msg.id,
      },
    });
    await interaction.reply({ content: 'Suggestion posted!', ephemeral: true });
  },
};


