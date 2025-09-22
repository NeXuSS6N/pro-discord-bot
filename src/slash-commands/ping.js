import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setColor(0x00b8ff)
      .addFields(
        { name: 'WebSocket', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
        { name: 'Latency', value: `${latency}ms`, inline: true }
      )
      .setTimestamp();
    await interaction.editReply({ content: '', embeds: [embed] });
  },
};


