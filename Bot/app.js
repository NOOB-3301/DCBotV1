import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits, Collection, MessageFlags } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const token = process.env.DC_TOKEN;
if (!token) {
  console.log("❌ No token found");
  process.exit(1);
}

// Add intents to allow the bot to receive slash command interactions properly
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Required for slash commands
    GatewayIntentBits.GuildMessages, // Optional: If you want messageCreate events
    GatewayIntentBits.MessageContent, // Optional: If you want to read message content
  ],
});

client.commands = new Collection();

// Load commands
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const commandModule = await import(`file://${filePath}`);
      const command = commandModule.default;
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command); // ✅ Use raw command object
      } else {
        console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${filePath}:`, error);
    }
  }
}

// Ready event
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
    console.log(interaction)
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(token);
