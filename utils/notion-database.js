require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

(async () => {
  const response = await notion.search({
    query: 'Tasks Tracker',
  });

  console.log(response.results[0].id); // <-- ได้ database_id
})();