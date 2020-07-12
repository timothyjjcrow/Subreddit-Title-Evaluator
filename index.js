const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const path = require('path');
const utils = require('./utils');
const RedditScraper = require('./redditScaper');
let rs = new RedditScraper();

const app = express();
const port = process.env.PORT;

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/scrape/:subreddit/:count/:timeFrame', async (req, res, next) => {
    let subreddit = req.params.subreddit.trim();
    let count; 
    let sortedData;
    let timeFrame = req.params.timeFrame;

    try{
       count = Number(req.params.count);
       if(isNaN(count)) throw 'Not a number';
       if(count > 5000) throw 'Too many posts!  Max 5,000 allowed.';
       if(count <= 0) throw 'Post count must be >= 1';
       if(!Number.isInteger(count)) throw 'Floating points not allowed';
       if(subreddit.length === 0) throw 'Subreddit cannot be empty';
       if(!utils.timeFrames.includes(timeFrame)) throw 'timeFrame invalid';
        
    } catch(err){
        console.log(err);
        res.status(400);
        res.send({message: err});
        return;
    }

    try{
        scrapedObject = await rs.scrapeSubreddit(subreddit, count, timeFrame);
    }catch(e){
        
        let errMsg = 'Something went wrong with subreddit: ' + subreddit + ', or there is currently too much traffic';
        
        if(e.name == 'SubNotFound') errMsg = e.message;
        if(e.name == 'TrafficError') errMsg = e.message;

        let errorToSend = {
            message: errMsg,
            ratelimitRemaining: e.ratelimitRemaining,
            ratelimitExpiration: e.ratelimitExpiration
        }

        console.log(e);
        res.status(400);
        res.json(errorToSend);
        return;
    }

    sortedData = scrapedObject.dataArray;

    if(sortedData.length === 0){
        res.status(400);
        res.send('Subreddit not found');
    }else{
        res.status(200);
        res.json({
            subreddit: subreddit === 'all' ? 'all' : scrapedObject.subreddit,
            timeFrame,
            data : sortedData,
            ratelimitRemaining : scrapedObject.ratelimitRemaining,
            ratelimitExpiration: scrapedObject.ratelimitExpiration,
        });
    }
})

// HTTPS Redirect for production
if (process.env.NODE_ENV !== 'dev') {
    app.enable('trust proxy');
    app.use((req, res, next) => {
        if (req.secure) {
            next();
        } else {
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
  }

// Static Files
app.use(express.static(path.join(__dirname, './public/')));

//Start Listening
app.listen(port, () => {
    console.log(`TitleScraper server running on port: ${port}!`);
  }
);


