var assert = require('assert');
let axios = require('axios');
const tybot = require("..");
const tybotRoute = tybot.router;
var express = require('express');
var app = express();
app.use("/", tybotRoute);
app.use((err, req, res, next) => {
  console.error("General error", err);
});
require('dotenv').config();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bots_data = require('./conversation-reply_json_buttons_bot.js').bots_data;
const PROJECT_ID = "projectID"; //process.env.TEST_ACTIONS_PROJECT_ID;
const REQUEST_ID = "support-group-" + PROJECT_ID + "-" + uuidv4().replace(/-/g, "");
const BOT_ID = "botID"; //process.env.TEST_ACTIONS_BOT_ID;
const CHATBOT_TOKEN = "XXX"; //process.env.ACTIONS_CHATBOT_TOKEN;
const { TiledeskChatbotUtil } = require('../utils/TiledeskChatbotUtil');

let SERVER_PORT = 10001

describe('Conversation for Reply test', async () => {

  let app_listener;
  let util = new TiledeskChatbotUtil();
  
  before(() => {
    return new Promise(async (resolve, reject) => {
      console.log("Starting tilebot server...");
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
            console.log("Tilebot route successfully started.");
            var port = SERVER_PORT;
            app_listener = app.listen(port, () => {
              console.log('Tilebot connector listening on port ', port);
              resolve();
            });
          });
      }
      catch (error) {
        console.error("error:", error)
      }

    })
  });

  after(function (done) {
    app_listener.close(() => {
      // console.log('ACTIONS app_listener closed.');
      done();
    });
  });

  it('/replyv2 success with json buttons', (done) => {

    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      // console.log("message:", JSON.stringify(message, null, "  "));
      const command1 = message.attributes.commands[1];
      assert(command1.type === "message");
      assert(command1.message.text === 'Please select an option');
      assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 3);
      // button 1
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].type === "action");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].value === "Button1");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].action === "#action_id");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].alias === "button1 alias");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].show_echo === true);
        //button 2
        assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 3);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].type === "text");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].value === "Button2 text");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].action === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].alias === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].show_echo === true);
        //button 3
        assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 3);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].type === "url");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].value === "Button3 link");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].link === "http://");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].action === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].alias === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].show_echo === true);

        util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          listener.close(() => {
            done();
          });
        }
      });
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      // console.log('endpointServer started', listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/json buttons replyv2',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      sendMessageToBot(request, BOT_ID, () => {
        // console.log("Message sent:\n", request);
      });
    });
  });

  it('/reply (v1) success with json buttons', (done) => {

    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      // console.log("message:", JSON.stringify(message, null, "  "));
      const command1 = message.attributes.commands[1];
      assert(command1.type === "message");
      assert(command1.message.text === 'Please select an option');
      assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 3);
      // button 1
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].type === "action");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].value === "Button1");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].action === "#action_id");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].alias === "button1 alias");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].show_echo === true);
        //button 2
        assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 3);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].type === "text");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].value === "Button2 text");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].action === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].alias === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].show_echo === true);
        //button 3
        assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 3);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].type === "url");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].value === "Button3 link");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].link === "http://");
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].action === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].alias === undefined);
        assert(message.attributes.commands[1].message.attributes.attachment.buttons[2].show_echo === true);

        util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          listener.close(() => {
            done();
          });
        }
      });
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      // console.log('endpointServer started', listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/json buttons reply',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      sendMessageToBot(request, BOT_ID, () => {
        // console.log("Message sent:\n", request);
      });
    });
  });

  it('/reply (v2) no json buttons', (done) => {

    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      // console.log("message:", JSON.stringify(message, null, "  "));
      assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 2);
      // button 1
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].type === "action");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].value === "one");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].show_echo === true);
      //button 2
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].type === "action");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].value === "two");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].show_echo === true);

        util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          listener.close(() => {
            done();
          });
        }
      });
    });

    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      // console.log('endpointServer started', listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/json buttons reply (v2) normal buttons',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      sendMessageToBot(request, BOT_ID, () => {
        // console.log("Message sent:\n", request);
      });
    });
  });

  it('/reply (v1) no json buttons', (done) => {

    let listener;
    let endpointServer = express();
    endpointServer.use(bodyParser.json());
    endpointServer.post('/:projectId/requests/:requestId/messages', function (req, res) {
      res.send({ success: true });
      const message = req.body;
      // console.log("message:", JSON.stringify(message, null, "  "));
      assert(message.attributes.commands[1].message.attributes.attachment.buttons.length === 2);
      // button 1
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].type === "action");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].value === "one");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[0].show_echo === true);
      //button 2
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].type === "action");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].value === "two");
      assert(message.attributes.commands[1].message.attributes.attachment.buttons[1].show_echo === true);

        util.getChatbotParameters(REQUEST_ID, (err, attributes) => {
        if (err) {
          assert.ok(false);
        }
        else {
          listener.close(() => {
            done();
          });
        }
      });
    });


    listener = endpointServer.listen(10002, '0.0.0.0', () => {
      // console.log('endpointServer started', listener.address());
      let request = {
        "payload": {
          "senderFullname": "guest#367e",
          "type": "text",
          "sender": "A-SENDER",
          "recipient": REQUEST_ID,
          "text": '/json buttons reply normal buttons',
          "id_project": PROJECT_ID,
          "metadata": "",
          "request": {
            "request_id": REQUEST_ID
          }
        },
        "token": "XXX"
      }
      sendMessageToBot(request, BOT_ID, () => {
        // console.log("Message sent:\n", request);
      });
    });
  });

});

/**
 * A stub to send message to the "ext/botId" endpoint, hosted by tilebot on:
 * /${TILEBOT_ROUTE}/ext/${botId}
 *
 * @param {Object} message. The message to send
 * @param {string} botId. Tiledesk botId
 * @param {string} token. User token
 */
function sendMessageToBot(message, botId, callback) {
  const url = `http://localhost:${SERVER_PORT}/ext/${botId}`;
  // console.log("sendMessageToBot URL", url);
  const HTTPREQUEST = {
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
    json: message,
    method: 'POST'
  };
  myrequest(
    HTTPREQUEST,
    function (err, resbody) {
      if (err) {
        if (callback) {
          callback(err);
        }
      }
      else {
        if (callback) {
          callback(null, resbody);
        }
      }
    }, false
  );
}

/**
 * A stub to get the request parameters, hosted by tilebot on:
 * /${TILEBOT_ROUTE}/ext/parameters/requests/${requestId}?all
 *
 * @param {string} requestId. Tiledesk chatbot/requestId parameters
 */
// function getChatbotParameters(requestId, callback) {
//   const url = `${process.env.TILEBOT_ENDPOINT}/ext/parameters/requests/${requestId}?all`;
//   const HTTPREQUEST = {
//     url: url,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     method: 'get'
//   };
//   myrequest(
//     HTTPREQUEST,
//     function (err, resbody) {
//       if (err) {
//         if (callback) {
//           callback(err);
//         }
//       }
//       else {
//         if (callback) {
//           callback(null, resbody);
//         }
//       }
//     }, false
//   );
// }

function myrequest(options, callback, log) {
  if (log) {
    console.log("API URL:", options.url);
    console.log("** Options:", JSON.stringify(options));
  }
  axios(
    {
      url: options.url,
      method: options.method,
      data: options.json,
      params: options.params,
      headers: options.headers
    })
    .then((res) => {
      if (log) {
        console.log("Response for url:", options.url);
        console.log("Response headers:\n", JSON.stringify(res.headers));
        //console.log("******** Response for url:", res);
      }
      if (res && res.status == 200 && res.data) {
        if (callback) {
          callback(null, res.data);
        }
      }
      else {
        if (callback) {
          callback(TiledeskClient.getErr({ message: "Response status not 200" }, options, res), null, null);
        }
      }
    })
    .catch((error) => {
      // console.error("An error occurred:", error);
      if (callback) {
        callback(error, null, null);
      }
    });
}
