import { EmbedBuilder } from 'discord.js';

export function baseEmbed() {
  return new EmbedBuilder().setColor(0x5865f2).setTimestamp();
}

export function successEmbed(title, description) {
  return baseEmbed().setColor(0x22c55e).setTitle(title).setDescription(description);
}

export function errorEmbed(title, description) {
  return baseEmbed().setColor(0xef4444).setTitle(title).setDescription(description);
}


