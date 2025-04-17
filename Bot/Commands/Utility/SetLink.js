import { SlashCommandBuilder } from 'discord.js';
import { setLink } from '../../CollabLink.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setlink')
    .setDescription('Set the link to collab!')
    .addStringOption(option =>
        option.setName('link')
            .setDescription('Enter the collab backend url...')
            .setRequired(true)),

  async execute(interaction) {
    console.log(interaction)
    console.log("the text is: ", interaction.options.getString('link'))
    const newLink = interaction.options.getString('link')
    setLink(newLink)
    await interaction.reply('Pong!');
},
};

