import { SlashCommandBuilder } from 'discord.js';
import { getLink } from '../../CollabLink.js';

const link = getLink()
export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
    
  async execute(interaction) {
    await interaction.reply('Pong!, the link is ' + link);
  },
};
