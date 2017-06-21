'use strict';
var VERIFY_TOKEN = "YOUR_TOKEN";
var PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN";
var GOOGLE_API = "YOUR_GOOGLE_SEARCH_API";

var https = require('https');
var jquery = require('jquery');
var https = require('https');
var StringDecoder = require('string_decoder').StringDecoder;


exports.handler = (event, context, callback) => {

  // process GET request
  if(event.queryStringParameters){
    var queryParams = event.queryStringParameters;

    var rVerifyToken = queryParams['hub.verify_token']

    if (rVerifyToken === VERIFY_TOKEN) {
      var challenge = queryParams['hub.challenge']

      var response = {
        'body': parseInt(challenge),
        'statusCode': 200
      };

      callback(null, response);
    }else{
      var response = {
        'body': 'Error, wrong validation token',
        'statusCode': 422
      };

      callback(null, response);
    }

  // process POST request
  }else{
    var data = JSON.parse(event.body);

    // Make sure this is a page subscription
    if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
        var pageID = entry.id;
        var timeOfEvent = entry.time;
        // Iterate over each messaging event
        entry.messaging.forEach(function(msg) {
          if (msg.message) {
            receivedMessage(msg);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        });
    });

    }
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    var response = {
      'body': "ok",
      'statusCode': 200
    };

    callback(null, response);
  }
}
function receivedMessage(event) {
  console.log("Message data: ", event.message);

  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));
  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;
  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        //sendGenericMessage(senderID);
        break;
      default:
        sendTextMessage(senderID, messageText);
    }
   
    
    var data_string="";//data String to connect recieved json chunks
    var req=https.get( GOOGLE_API+messageText,
  (res) => {
      
  //Prints log to console about https response's status and header
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
      
  //decoder for decoding buffer's data to string
  var decoder = new StringDecoder('utf8');
      
  res.on('data', (d) => {
    var textChunk = decoder.write(d);
    data_string=data_string+textChunk;
    //pushes data into 'data_string' to complete the https response's data part
  });
      
  res.on('end',function(){
      console.log('data received: ', data_string);
      var json=JSON.parse(data_string); //parse the JSON to read the needed parts
      for(var i=0;i<5;i++){
          //reply 5 times that includes 2 links with snippets.
          //2 links each, so that it does not exceed the FB messenger's limit (around 640B?)
          sendTextMessage(senderID,
          json.items[2*i].link + "\n"
          + json.items[2*i].snippet + '\n'
          + json.items[2*i+1].link +'\n'
          + json.items[2*i+1].snippet);
      }
  })
      

}).on('error', (e) => {
  console.error(e);
});


  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  callSendAPI(messageData);
}
function callSendAPI(messageData) {
  var body = JSON.stringify(messageData);
  var path = '/v2.6/me/messages?access_token=' + PAGE_ACCESS_TOKEN;
  var options = {
    host: "graph.facebook.com",
    path: path,
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  };
  var callback = function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {

    });
  }
  var req = https.request(options, callback);
  req.on('error', function(e) {
    console.log('problem with request: '+ e);
  });

  req.write(body);
  req.end();
}
