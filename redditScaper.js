const snoowrap = require('snoowrap');

const utils = require('./utils');
require('dotenv').config()

module.exports = class RedditScraper{
    constructor(){
        this.r = new snoowrap({
            userAgent: 'titleFinder by CrowlesRedditBot',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        });
        // this.r.config({requestDelay: 1000, warnings: false});
    }

    async scrapeSubreddit(sub, postCount, timeFrame){
        let vault = {};
        let time = "all";
        let errorFound = null;
        if(utils.timeFrames.includes(timeFrame)){
            time = timeFrame;
        }
        let topPosts = await this.r.getSubreddit(sub).getTop({time})
            .fetchMore({amount: postCount, append: true})
            .catch(err => {
                console.log(err)
                errorFound = err;
            });
            
        if(errorFound) throw err;

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
    
        return titleArray;
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