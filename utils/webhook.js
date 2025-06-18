const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
    const event = req.body.events?.[0];
    const userId = event?.source?.userId;
    console.log("Received event:", event);
    if (!userId) {
        console.warn("❌ userId not found in event:", event);
        return res.sendStatus(400); // หรือแค่ return ก็ได้
    }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
