import dotenv from "dotenv"
import { Client,Events,GatewayIntentBits } from "discord.js"

dotenv.config()

const token = process.env.DC_TOKEN
if (!token) {
    console.log("no token found")
    process.exit(1)
}