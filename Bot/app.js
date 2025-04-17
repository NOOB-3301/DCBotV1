import dotenv from "dotenv";
import { Client, Events, GatewayIntentBits, Collection, MessageFlags, Partials } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import axios from "axios";
import { getLink } from "./CollabLink.js";
import { connectDb } from "./db.js";
import { generateEmbedding } from "./DataBaseCalls/Embedding.js";
import Message from "./DataBaseCalls/Message.model.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const token = process.env.DC_TOKEN;
if (!token) {
  console.log("❌ No token found");
  process.exit(1);
}
connectDb()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));
// Add intents to allow the bot to receive slash command interactions properly
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Required for slash commands
    GatewayIntentBits.GuildMessages, // Optional: If you want messageCreate events
    GatewayIntentBits.MessageContent, // Optional: If you want to read message content
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
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
  // console.log(interaction)
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

client.on(Events.MessageCreate, async (message) => {
  const newLink = getLink()
  message.channel.sendTyping()
  if (message.author.bot) return; // Ignore messages from bots

  console.log("the message is : ", message.content)

  const embedding = await generateEmbedding(`[user]:${message.content}`)
  try {
    const similarMessages = await Message.aggregate([
      {
        "$vectorSearch":{
          "index":"vector_index",
          "path":"embedding",
          "queryVector":embedding,
          "limit":5,
          "numCandidates":100
        }
      }
    ])
    console.log(similarMessages)
  } catch (err) {
    console.error("Error in vector search:", err);
  }
  
  // const resp = await axios.post(`${newLink}api/generate`, 
  const resp = await axios.post(`http://localhost:11434/api/generate`,

    {
      // "model": "ZeroTwoV1",
      "model": "deepseek-r1:1.5b",
      "prompt": `${message.content}`,
      "stream": false
    }
  )
  

  // const newEmbedding = await generateEmbedding(`[user]:${message.content} [you]:${resp.data.response}`)

  // const newMessage = await Message.create({
  //   prompt: message.content,
  //   response:resp.data.response,
  //   embedding: newEmbedding
  // })

  // console.log(newMessage)

  message.reply(`the reply is ${resp.data.response}`)
})

client.login(token);
