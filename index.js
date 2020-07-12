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
       if(isNaN(count)) throw 'Not a number';
       if(count > 100000) throw 'Too many posts!  Max 10,000 allowed.';
       if(count <= 0) throw 'Post count must be >= 1';
       if(!Number.isInteger(count)) throw 'Floating points not allowed';
       if(subreddit.length === 0) throw 'Subreddit cannot be empty';
    } catch(err){
        console.log(err);
        res.status(400);
        res.send(err);
        return;
    }

    let sortedData = await rs.scrapeSubreddit(subreddit, count);
    
    if(sortedData.length === 0){
        res.status(400);
        res.send('Subreddit not found');
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


