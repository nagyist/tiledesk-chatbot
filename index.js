require('dotenv').config();
var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());

//const tybot = require("@tiledesk/tiledesk-tybot-connector");
const tybot = require("./tybotRoute");
const tybotRoute = tybot.router;
app.use("/", tybotRoute); // /tybot


// TEMP
// const bots_data = require('./tybotRoute/test/conversation-actions_bot.js').bots_data;

tybot.startApp(
  {
    MONGODB_URI: process.env.mongoUrl,
    // bots: bots_data,
    API_ENDPOINT: process.env.API_ENDPOINT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    // CACHE_ENABLED: process.env.CACHE_ENABLED,
    log: process.env.API_LOG
  }, () => {
    console.log("Tilebot route successfully started.");
    var port = process.env.PORT || 3000;
    app.listen(port, function () {
      console.log('Tilebot connector listening on port ', port);
    });
  });
