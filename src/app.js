// AddItemToNotion("Maybe add some color options", "Jasper", "Suggestion");
// AddItemToNotion("Add enums", "Jasper", "Feature-request");
// AddItemToNotion("What a great tool!", "Jasper", "Praise");

import express from "express";
import { VerifyDiscordRequest } from "./discord/utils.js";
import * as dotenv from "dotenv";
import { InteractionResponseType, InteractionType } from "discord-interactions";
import { AddItemToNotion } from "./notion.js";
import { HasGuildCommands, SUGGEST_COMMAND } from "./discord/commands.js";

dotenv.config();

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

// Parse request body and verifies incoming requests using discord-interactions package
if (process.env.PUBLIC_KEY) {
  app.use(
    express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) })
  );
} else {
  console.log("Invalid public key");
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "suggest" guild command
    if (name === "suggest") {
      const user = `${req.body.member.user.username}#${req.body.member.user.discriminator}`;
      const tag = req.body.data.options[0].value;
      const msg = req.body.data.options[1].value;

      let ret;

      try {
        AddItemToNotion(msg, user, tag);
        ret = "Succesfully added ✨";
      } catch (e) {
        ret = "Something went wrong";
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: ret,
        },
      });
    }
  }
});

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [SUGGEST_COMMAND]);
});
