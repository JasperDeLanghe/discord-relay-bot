import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_SECRET });

const databaseId = process.env.NOTION_DATABASE;

export const AddItemToNotion = async (
  text: string,
  user: string,
  tag: string
) => {
  try {
    if (databaseId) {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Message: {
            title: [
              {
                text: {
                  content: text,
                },
              },
            ],
          },
          User: {
            rich_text: [
              {
                text: {
                  content: user,
                },
              },
            ],
          },
          Type: {
            select: {
              name: tag,
            },
          },
        },
      });
      console.log(response);
      console.log("Success! Entry added.");
    } else {
      console.log("Database ID unspecified.");
    }
  } catch (error: any) {
    console.error(error.body);
  }
};
