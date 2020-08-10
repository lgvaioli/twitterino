# Twitterino

A simple and working example of a Twitter signup/login flow and API usage, implemented in Node and React.

You login with your Twitter account, and can see some info about your user profile and tweet a message. That's it!

Check out the [live version](https://twitterino.herokuapp.com/)! (it might take a little
while to load because it's hosted on Heroku's free plan).

## Getting Started

Twitterino is designed to be easily deployable to Heroku, though deployment to localhost is also possible.

To deploy it either way, you will first need to create a [Twitter app](https://developer.twitter.com/en/docs/basics/apps/overview).

After you create the Twitter app, you need to configure the callback URLs to point to your deploy, e.g. if you're deploying to localhost on port 7500, you would add your callback URL as `http://127.0.0.1:7500/oauth/callback`; if you're deploying to Heroku and your app is reachable at `https://my-heroku-twitterino.com`, you would add `https://my-heroku-twitterino.com/oauth/callback`.

Explaining how to create a Twitter app, OAuth and related stuff is out of the scope of this document.


### Deploying to localhost

#### Creating the *.env* file

If you deploy to localhost, you'll need to create an *.env* file from which Twitterino will read some necessary variables. This file is not supplied because the information needed (most importantly, Twitter API keys) varies from deploy to deploy.

You can use the following as a template, replacing variables as needed:

```
TWITTER_CONSUMER_KEY=<your Twitter app consumer key>
TWITTER_CONSUMER_SECRET=<your Twitter app consumer secret>
SESSION_SECRET=<some strong password>
```

#### Installing dependencies and running the program

Install the program's dependencies and run it with:
`npm install && npm start`

If everything went fine, you should see a message like `Server listening at http://127.0.0.1:7500` in the console.

Do mind that if you plan to modify the React frontend, you will need to install React's dependencies and rebuild it with:

`cd frontend && npm install && npm run build`

### Deploying to Heroku

The basic steps to deploy to Heroku are the following:

1. Create a Heroku app.
2. Configure the env variables with `heroku config`.
3. Push the app to Heroku with `git push heroku`.

I won't cover step 1 because it's outside the scope of this document. Heroku has an [excellent tutorial](https://devcenter.heroku.com/articles/getting-started-with-nodejs) covering Node.js deployment which can help you to get started.

After you've completed step 1, you have to provision the following variables with the `heroku config:set` command:
```
TWITTER_CONSUMER_KEY=<your Twitter app consumer key>
TWITTER_CONSUMER_SECRET=<your Twitter app consumer secret>
SESSION_SECRET=<some strong password>
APP_URL=<your Heroku app's URL, e.g. https://my-twitterino-deploy.herokuapp.com>
```

After all that is done, you just have to push it all to Heroku with:

`git push heroku`

and you're done. Open up your Heroku Twitterino app with `heroku open` and you should see it running!