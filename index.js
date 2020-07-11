const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const path = require('path');

const RedditScraper = require('./redditScaper');
let rs = new RedditScraper();

const app = express();
const port = process.env.PORT;

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/scrape/:subreddit/:count', async (req, res, next) => {
    let subreddit = req.params.subreddit;
    let count; 

    try{
       count = Number(req.params.count);
       if(isNaN(count)) throw new Error();
    } catch{
        res.status(400);
        res.send('Check url parameters, count (number) sent incorrectly');
        return;
    }

    let sortedData = await rs.scrapeSubreddit(subreddit, count);
    
    if(sortedData.length === 0){
        res.status(400);
        res.json('Subreddit not found');
    }else{
        res.status(200);
        res.json(sortedData);
    }
})

// Static Files
app.use(express.static(path.join(__dirname, './public/')));

//Start Listening
app.listen(port, () => {
    console.log(`TitleScraper server running on port: ${port}!`);
  }
);


