const snoowrap = require('snoowrap');

const utils = require('./utils');
const fs = require('fs');
require('dotenv').config()

module.exports = class RedditScraper{
    constructor(){
        this.r = new snoowrap({
            userAgent: 'titleFinder by CrowlesRedditBot',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        });
        // this.r.config({continueAfterRatelimitError: false, requestDelay: 1000});
    }

    async scrapeSubreddit(sub, postCount, timeFrame){
        let vault = {};
        let time = "all";
        let errorFound = null;
        let subreddit;
        if(utils.timeFrames.includes(timeFrame)){
            time = timeFrame;
        }
        let topPosts = await this.r.getSubreddit(sub).getTop({time})
            .fetchMore({amount: postCount, append: true})
            .catch(err => {
                console.log('in snoowrap catch: ', err.message, ' Name: ', err.name);
                errorFound = err;
            });

        if(!topPosts || errorFound) throw{name: 'TrafficError', message: 'Too much traffic... Request limit resets every 10 minutes', ratelimitRemaining: this.r.ratelimitRemaining, ratelimitExpiration: this.r.ratelimitExpiration};
        if(topPosts.length === 0) throw{name: 'SubNotFound', message: 'Subreddit not found!', ratelimitRemaining: this.r.ratelimitRemaining, ratelimitExpiration: this.r.ratelimitExpiration};
        // let postsJson = topPosts.toJSON();
        // let jsonString = JSON.stringify(postsJson);
        // fs.writeFile('postJson', jsonString, 'utf8', () => null);
        try{
            subreddit = topPosts[0].subreddit.display_name;
        }catch{
            subreddit = sub;
        }

        let titles = topPosts.map(post => {
            return {
                title: post.title, 
                ups: post.ups,
            }
        });
    
        titles.forEach(title => this.addTitleToVault(vault, title));
        
        // Put vault into array sorted by upvote count
        let titleArray = []
        Object.keys(vault).forEach(key => titleArray.push({word: key, ups: vault[key].ups, occ: vault[key].occ}))
        titleArray.sort((a,b) => {
            if(a.ups < b.ups) return -1
            else if(a.ups > b.ups) return 1
            else return 0
        })
    
        return {dataArray: titleArray, subreddit, ratelimitRemaining: this.r.ratelimitRemaining, ratelimitExpiration: this.r.ratelimitExpiration};
    }

    addTitleToVault(vault, title){
        title.title.split(' ').forEach(word => {
            // Mutate word to make more useful
            word = word.toLowerCase();
            word = this.onlyAlphabetic(word);
            if(word === '') return;
            // Skip word if found in common word list
            if(utils.stopWords.indexOf(word) !== -1) return;

            if (word in vault)
                vault[word] = {ups: vault[word].ups + title.ups, occ: vault[word].occ + 1}; 
            else{
                vault[word] = {ups: title.ups, occ: 1};
            }
        });
    }

    onlyAlphabetic(word){
        // Delete all non-alphabetic characters from word
        return word.replace(/[^0-9a-z]/gi, '');
    }
}