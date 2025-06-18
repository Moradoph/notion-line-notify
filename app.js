require("dotenv").config();
const { Client } = require("@notionhq/client");
const axios = require("axios");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;
const channelToken = process.env.LINE_CHANNEL_TOKEN;
const targetId = process.env.LINE_TARGET_ID;

let lastChecked = new Date(Date.now() - 3000 * 1000).toISOString();

app.get("/", (req, res) => {
  res.send("Bot is running...");
});

app.get("/wakeup", async (req, res) => {
  await checkNotion(); // ทำงานหลัก
  res.send("Checked Notion at " + new Date().toISOString());
});

// Core check logic
async function checkNotion() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: "Created time", direction: "descending" }],
      page_size: 10,
    });

    const newItems = response.results.filter(
      (item) => new Date(item.created_time) > new Date(lastChecked)
    );

    if (newItems.length > 0) {
      const messages = newItems.reverse().map((item) => {
        const title =
          item.properties?.หัวข้อ?.title?.[0]?.plain_text || "ระเบิดลง";
        return `- ${title}`;
      });

      const today = new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const fullMessage = `New Update in Notion ${today}:\n${messages.join("\n")}`;
      console.log(fullMessage);
      // await sendLineMessage(fullMessage);

      lastChecked = newItems[0].created_time;
    }
  } catch (error) {
    console.error(
      "Error checking Notion:",
      error.response?.data || error.message
    );
  }
}

async function sendLineMessage(message) {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: targetId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${channelToken}`,
        },
      }
    );
  } catch (error) {
    console.error(
      "Error sending LINE message:",
      error.response?.data || error.message
    );
  }
}

// Start web server
app.listen(port, () => {
  console.log(`Notion LINE Notify Bot is running on port ${port}`);
});
