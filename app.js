import 'dotenv/config';
import express from 'express';
import { Client } from "@notionhq/client"
import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';
import {
  TEST_COMMAND,
  RELAY_COMMAND,
  HasGuildCommands,
} from './commands.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Create a notion client
// const notion = new Client({ auth: process.env.NOTION_SECRET });
// Set the db id
// const databaseId = process.env.NOTION_DATABASE;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
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

    // "test" guild command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ',
        },
      });
    }

    if (name === 'relay') {
        console.log(data);
        // Get the user message
        // Relay to notion
        try {
            const response = await notion.pages.create({
              parent: { database_id: databaseId },
              properties: {
                title: { 
                  title:[
                    {
                      "text": {
                        "content": "This is a test from Discord"
                      }
                    }
                  ]
                }
              },
            })
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  // Fetches a random emoji to send from a helper function
                  content: 'Succesfully added to Notion',
                },
              });
          } catch (error) {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  // Fetches a random emoji to send from a helper function
                  content: 'Failed to add to Notion',
                },
              });
          }
        // Send a success message
        
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);

  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    TEST_COMMAND,
    RELAY_COMMAND
  ]);
});