require('dotenv').config();

const line = require('@line/bot-sdk');
const express = require('express');

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // const completion = await openai.createCompletion({
  //   model: "text-davinci-003",
  //   prompt: event.message.text,
  //   max_tokens: 256,
  //   // temperature: 0.7,
  //   // top_p: 1,
  //   // frequency_penalty: 0,
  //   // presence_penalty: 0,
  // });
  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{
      role: 'user',
      content: event.message.text,
    }],
    max_tokens: 200,
  });

  const [choices] = data.choices;

  const echo = { type: 'text', text: choices.message.content.trim() || '抱歉，我沒有話可說了。' };

  return client.replyMessage(event.replyToken, echo);

  // async function ask(prompt) {
  //     const response = await openai.createCompletion({
  //         model: "text-davinci-002",
  //         prompt,
  //         temperature: 0.7,
  //         max_tokens: 256,
  //         top_p: 1,
  //         frequency_penalty: 0,
  //         presence_penalty: 0,
  //     });
  //   }
  // ask(event.message.text);

  // // create a echoing text message
  // const echo = { type: 'text', text: completion.data.choices[0].text };

  // // use reply API
  // return client.replyMessage(event.replyToken, echo);

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

