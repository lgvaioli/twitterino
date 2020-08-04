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


// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    consumerKey: process.env['TWITTER_CONSUMER_KEY'],
    consumerSecret: process.env['TWITTER_CONSUMER_SECRET'],
    callbackURL: `http://127.0.0.1:${PORT}/oauth/callback`,
    proxy: trustProxy
  },
  function(token, tokenSecret, profile, cb) {
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
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

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
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

    console.log(`About to post a message for this user: ${JSON.stringify(req.user)}`);

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
