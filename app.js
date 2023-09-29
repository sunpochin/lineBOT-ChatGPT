require('dotenv').config();

const line = require('@line/bot-sdk');
const express = require('express');
// const { Configuration, OpenAIApi } = require('openai');
const { OpenAI } = require('openai');

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};


const client = new line.Client(config);


// console.log('line.messagingApi: ', line.messagingApi);
// // create LINE SDK client
// const client = new line.messagingApi.MessagingApiClient({
//   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
// });

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: event.message.text ,
  });

  // create a echoing text message
  const echo = { type: 'text', text: completion.data.choices[0].text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);

  // // create a echoing text message
  // const echo = { type: 'text', text: event.message.text };

  // // use reply API
  // return client.replyMessage(event.replyToken, echo);
}
// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

