var assert = require('assert');
let axios = require('axios');
const tybot = require("../");
const tybotRoute = tybot.router;
var express = require('express');
var app = express();
const winston = require('../utils/winston');
app.use("/", tybotRoute);
app.use((err, req, res, next) => {
  winston.error("General error", err);
});
require('dotenv').config();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { TiledeskChatbotUtil } = require('../utils/TiledeskChatbotUtil');
const tilebotService = require('../services/TilebotService');
const bots_data = require('./conversation-askgpt_bot.js').bots_data;
const PROJECT_ID = "projectID"; //process.env.TEST_ACTIONS_PROJECT_ID;
const REQUEST_ID = "support-group-" + PROJECT_ID + "-" + uuidv4().replace(/-/g, "");
const BOT_ID = "botID"; //process.env.TEST_ACTIONS_BOT_ID;
const CHATBOT_TOKEN = "XXX"; //process.env.ACTIONS_CHATBOT_TOKEN;

let SERVER_PORT = 10001

describe('Conversation for AskGPT test', async () => {

  let app_listener;
  let util = new TiledeskChatbotUtil();

  before(() => {
    return new Promise(async (resolve, reject) => {
      winston.info("Starting tilebot server...");
      try {
        tybot.startApp(
          {
            // MONGODB_URI: process.env.MONGODB_URI,
            bots: bots_data,
            TILEBOT_ENDPOINT: process.env.TILEBOT_ENDPOINT,
            API_ENDPOINT: process.env.API_ENDPOINT,
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: process.env.REDIS_PORT,
            REDIS_PASSWORD: process.env.REDIS_PASSWORD
          }, () => {
            winston.info("Tilebot route successfully started.");
            var port = SERVER_PORT;
            app_listener = app.listen(port, () => {
              winston.info('Tilebot connector listening on port ' + port);
              resolve();
            });
          });
      }
      catch (error) {
        winston.error("error:", error)
      }

    })
  });

  after(function (done) {
    app_listener.close(() => {
      done();
    });
  });

  it('/gpt success (key from integrations) - invokes the askgpt mockup and test the returning attributes', (done) => {
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: this is mock gpt reply");

      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "this is mock gpt reply");
          listener.close(() => {
            done();
          });
        }
      });

    });

    endpointServer.post('/api/qa', function (req, res) {
      let reply = {}
      let http_code = 200;
      if (!req.body.question) {
        reply.error = "question field is mandatory"
        http_code = 400;
      }
      else if (!req.body.kbid) {
        reply.error = "kbid field is mandatory"
        http_code = 400;
      }
      else if (!req.body.gptkey) {
        reply.error = "gptkey field is mandatory"
        http_code = 400;
      }
      else {
        reply = {
          answer: "this is mock gpt reply",
          success: true,
          source_url: "http://test"
        }
      }

      res.status(http_code).send(reply);
    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {
      let http_code = 200;
      let reply = {
        _id: "656728224b45965b69111111",
        id_project: "62c3f10152dc740035000000",
        name: "openai",
        value: {
          apikey: "example_api_key",
          organization: "TIledesk"
        }
      }

      res.status(http_code).send(reply);
    })

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = {
        _id: "656728224b45965b69111111",
        id_project: "62c3f10152dc740035000000",
        name: "openai",
        value: {
          apikey: "example_api_key",
          organization: "TIledesk"
        }
      }

      res.status(http_code).send(reply);
    })

    // no longer used in this test --> key retrieved from integrations
    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = { gptkey: "sk-123456" };
      let http_code = 200;

      res.status(http_code).send(reply);
    });

    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt success{"last_user_message":"come ti chiami"}',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });

  it('/gpt success (key from kbsettings) - invokes the askgpt mockup and test the returning attributes', (done) => {
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: this is mock gpt reply");

      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "this is mock gpt reply");
          listener.close(() => {
            done();
          });
        }
      });

    });

    endpointServer.post('/api/qa', function (req, res) {
      let reply = {}
      let http_code = 200;
      if (!req.body.question) {
        reply.error = "question field is mandatory"
        http_code = 400;
      }
      else if (!req.body.kbid) {
        reply.error = "kbid field is mandatory"
        http_code = 400;
      }
      else if (!req.body.gptkey) {
        reply.error = "gptkey field is mandatory"
        http_code = 400;
      }
      else {
        reply = {
          answer: "this is mock gpt reply",
          success: true,
          source_url: "http://test"
        }
      }

      res.status(http_code).send(reply);
    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = "Integration not found";

      res.status(http_code).send(reply);
    })

    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = { gptkey: "sk-123456" };
      let http_code = 200;

      res.status(http_code).send(reply);
    });

    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt success{"last_user_message":"come ti chiami"}',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });

  it('/gpt fail - invokes the askgpt mockup and test the returning attributes', (done) => {
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: No answers");

      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "No answers");
          listener.close(() => {
            done();
          });
        }
      });

    });

    endpointServer.post('/api/qa', function (req, res) {
      let reply = {}
      let http_code = 200;
      if (!req.body.question) {
        reply.error = "question field is mandatory"
        http_code = 400;
      }
      else if (!req.body.kbid) {
        reply.error = "kbid field is mandatory"
        http_code = 400;
      }
      else if (!req.body.gptkey) {
        reply.error = "gptkey field is mandatory"
        http_code = 400;
      }
      else {
        reply = {
          answer: "No answers",
          success: false
        }
      }

      res.status(http_code).send(reply);
    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = {
        _id: "656728224b45965b69111111",
        id_project: "62c3f10152dc740035000000",
        name: "openai",
        value: {
          apikey: "example_api_key",
          organization: "TIledesk"
        }
      }

      res.status(http_code).send(reply);
    })

    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = { gptkey: "sk-123456" };
      let http_code = 200;

      res.status(http_code).send(reply);
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt fail',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });

  it('/gpt fail - move to false intent if gptkey does not exists (key undefined)', (done) => {
    
    process.env.GPTKEY='' // Used to nullify the env variable
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: No answers");

      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "No answers");
          listener.close(() => {
            done();
          });
        }
      });

    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = "Integration not found";

      res.status(http_code).send(reply);
    })

    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = { gptkey: undefined };
      let http_code = 200;

      res.status(http_code).send(reply);
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt fail',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });

  it('/gpt fail - move to false intent if gptkey does not exists (missing key)', (done) => {
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: No answers");

      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "No answers");
          listener.close(() => {
            done();
          });
        }
      });

    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = "Integration not found";

      res.status(http_code).send(reply);
    })


    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = {};
      reply.error = "no knowledge base settings found"
      http_code = 404;

      res.status(http_code).send(reply);
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt fail',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });

  it('/gpt fail - action question is undefined', (done) => {
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());

    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: No answers");
   
      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "No answers");
          listener.close(() => {
            done();
          });
        }
      });

    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = {
        _id: "656728224b45965b69111111",
        id_project: "62c3f10152dc740035000000",
        name: "openai",
        value: {
          apikey: "example_api_key",
          organization: "TIledesk"
        }
      }

      res.status(http_code).send(reply);
    })

    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = {};
      reply.error = "no knowledge base settings found"
      http_code = 404;

      res.status(http_code).send(reply);
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt_fail_noquestion',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });

  it('/gpt fail - action kbid is undefined', (done) => {
    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());

    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      assert(message.attributes.commands !== null);
      assert(message.attributes.commands.length === 2);
      const command2 = message.attributes.commands[1];
      assert(command2.type === "message");
      assert(command2.message.text === "gpt replied: No answers");

      util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          assert(attributes);
          assert(attributes["gpt_reply"] === "No answers");

          listener.close(() => {
            done();
          });

        }
      });

    });

    endpointServer.get('/:project_id/integration/name/:name', function (req, res) {

      let http_code = 200;
      let reply = {
        _id: "656728224b45965b69111111",
        id_project: "62c3f10152dc740035000000",
        name: "openai",
        value: {
          apikey: "example_api_key",
          organization: "TIledesk"
        }
      }

      res.status(http_code).send(reply);
    })

    endpointServer.get('/:project_id/kbsettings', function (req, res) {

      let reply = {};
      reply.error = "no knowledge base settings found"
      http_code = 404;

      res.status(http_code).send(reply);
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      winston.verbose('endpointServer started' + listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/gpt_fail_nokbid',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      tilebotService.sendMessageToBot(request, BOT_ID, () => {
        winston.verbose("Message sent:\n", request);
      });
    });
  });


});
