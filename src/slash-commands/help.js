import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('help').setDescription('Show help and available commands'),
  async execute(interaction) {
    const commands = interaction.client.commands;
    const embed = new EmbedBuilder()
      .setTitle('Help')
      .setDescription('List of available commands')
      .setColor(0x5865f2);

    for (const [name, cmd] of commands) {
      embed.addFields({ name: `/${name}`, value: cmd.data?.description ?? 'No description', inline: false });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};


