// deploy-commands.js
import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();
if (!process.env.DC_TOKEN) {
  console.error("❌ Bot token not found in environment variables.");
  console.log(process.env.DC_TOKEN);
  process.exit(1);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const commandFiles = readdirSync(path.join(__dirname, 'commands/Utility')).filter(file => file.endsWith('.js'));
console.log(commandFiles)
for (const file of commandFiles) {
  let  data  = await import(`./commands/Utility/${file}`);
  console.log(data)
  data = data.default.data;
  console.log(data)
  commands.push(data.toJSON());
}
console.log(commands)
const rest = new REST({ version: '10' }).setToken(process.env.DC_TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(
    Routes.applicationCommands("1361787647701291289"), // Replace with your bot's client ID
    { body: commands },
  );

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
