require("dotenv").config();
const { Client } = require("@notionhq/client");
const axios = require("axios");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;
const channelToken = process.env.LINE_CHANNEL_TOKEN;
const targetId = process.env.LINE_TARGET_ID;

let lastChecked = new Date(Date.now() - (3000 * 1000)).toISOString();


async function checkNotion() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: "Created time", direction: "descending" }],
      page_size: 10,
    });
    console.log(response.results[0]?.properties);
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
      const fullMessage = `New Update in Notion ${today} :\n${messages.join("\n")}`;
      console.log(fullMessage);
      await sendLineMessage(fullMessage);

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

setInterval(checkNotion, 60000); // เช็คทุก 1 นาที

console.log("Notion LINE Notify Bot is running...");
console.log("Last checked at:", lastChecked);
checkNotion(); // รันตอนเริ่มต้น
