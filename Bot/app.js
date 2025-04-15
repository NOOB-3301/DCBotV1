import dotenv from "dotenv"
import { Client,Events,GatewayIntentBits } from "discord.js"

dotenv.config()

const token = process.env.DC_TOKEN
if (!token) {
    console.log("no token found")
    process.exit(1)
}


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);