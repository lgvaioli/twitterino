"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Twitter = require('twitter');

const PORT = 3500;

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('./frontend/build'));

let client = new Twitter({
    consumer_key: 'yU4u1AdS7DZ5gVsO4IVxRZI0K',
    consumer_secret: 'm6Nn2MjbLfXPabcn3uCM6lEKA3b957QlvHezM8ihi8alK7LRm9',
    access_token_key: '701671306098507776-sniV4CdaNg4UC1wVFH44gNK5tm6rdy6',
    access_token_secret: 'aAOnkKVQJ0NAWyjUniLuBJAEHjCDbehFmD7kPE0Tp51LN'
  });

app.post("/message", (req, res) => {
    const message = req.body.message;
    const params = {status: message};

    client.post("statuses/update.json", params, function(error, tweets, response) {
        if (!error) {
            if(tweets.created_at !== "") {
                res.end("Successfully posted!")
            }
        } else {
            const twitterError = "Twitter error: " + error[0].message;
            res.end(twitterError);
        }
    });
});

app.get('*', (req, res) => {
    res.sendFile('./frontend/build/index.html');
});

app.listen(PORT, (err) => {
    if(err) {
        console.error(err);
        return;
    }

    console.log(`Server listening at http://127.0.0.1:${PORT}`);
});
