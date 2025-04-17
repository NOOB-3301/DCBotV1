import { SlashCommandBuilder } from 'discord.js';
import { getLink } from '../../CollabLink.js';

export default {
  data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!'),
  
  async execute(interaction) {
    const link = getLink()
    await interaction.reply('Pong!, the link is ' + link);
  },
};
