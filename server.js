require('dotenv').config();

var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
const Twitter = require('twitter');

// Careful with this, it's gotta match whatever callback_url you configured in your Twitter app
const PORT = 7500;

var trustProxy = false;
if (process.env.DYNO) {
  // Apps on heroku are behind a trusted proxy
  trustProxy = true;
}


// Setup passport's Twitter authentication strategy
passport.use(new Strategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `http://127.0.0.1:${PORT}/oauth/callback`,
    proxy: trustProxy
  },
  function(token, tokenSecret, profile, cb) {
    // FIXME: Here's where you check if the user is already in the database and if
    // not, you create a new account
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    return cb(null, profile);
  }));


// Setup passport stuff
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Log every request, for debugging purposes
app.use((req, res, next) => {
    console.log(`Got following request: ${req.url}`);
    next();
});

// Setup body parser and session middleware
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    if (req.user) {
        res.sendFile('index.html', { root: './frontend/build/' });
    } else {
        res.redirect('/login/twitter');
    }
  });

// This MUST come after the GET '/' route handler, because otherwise instead of hitting
// that handler, express.static automatically returns the frontend's index.html
app.use(express.static('./frontend/build'));

app.get('/user', (req, res) => {
  // I don't want to have the frontend dealing with Twitter's bullshit, so I return a nice user object
  // instead of Twitter's monstrosity.
  const niceUser = {
    username: req.user.username,
    twitterId: req.user.id,
    profilePicUrl: req.user.photos[0].value,
    tweetsCount: req.user._json.statuses_count,
    following: req.user._json.friends_count,
    followers: req.user._json.followers_count,
    currentStatus: req.user._json.status.text,
  };

  res.json(niceUser);
});

app.get('/login',
  function(req, res){
    res.send('FIXME: Implement /login');
  });

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/oauth/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.get('/logout',
  function(req, res) {
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

app.post("/message", (req, res) => {
    const message = req.body.message;
    const params = { status: message };

    console.log(`User '${req.user.username}' is a about to post the following: ${message}`);

    // FIXME: Is this how am I supposed to do this? It feels inefficient. Maybe you
    // can create a twitter client and reuse it across users? I'm not sure, the docs suck.
    const twitter = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.token,
        access_token_secret: req.user.tokenSecret,
      });
    
    twitter.post("statuses/update.json", params, function(error, tweets, response) {
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

app.listen(PORT, (err) => {
  if (err) {
    return console.log(`Could not set server to listen: ${err}`);
  }

  console.log(`Server listening at http://127.0.0.1:${PORT}`);
});
