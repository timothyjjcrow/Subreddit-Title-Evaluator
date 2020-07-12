let snoowrap = require('snoowrap');
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
        this.vault = {}
    }

    async scrapeSubreddit(sub, postCount){
        this.vault = {};
        let topPosts = await this.r.getSubreddit(sub).getTop({time: 'all'})
            .fetchMore({amount: postCount, append: true})
            .catch(err => {
                console.log(err)
            });
    
        let titles = topPosts.map(post => {
            return {
                title: post.title, 
                ups: post.ups,
            }
        });
    
        titles.forEach(title => this.addTitleToVault(title));
        
        // Put vault into array sorted by upvote count
        let titleArray = []
        Object.keys(this.vault).forEach(key => titleArray.push({word: key, ups: this.vault[key].ups, occ: this.vault[key].occ}))
        titleArray.sort((a,b) => {
            if(a.ups < b.ups) return -1
            else if(a.ups > b.ups) return 1
            else return 0
        })
    
        return titleArray;
    }

    addTitleToVault(title){
        title.title.split(' ').forEach(word => {
            // Mutate word to make more useful
            word = word.toLowerCase();
            word = this.onlyAlphabetic(word);

            // Skip word if found in common word list
            // if(utils.commonWordExclusions.indexOf(word) !== -1) return;

            if (word in this.vault)
                this.vault[word] = {ups: this.vault[word].ups + title.ups, occ: this.vault[word].occ + 1}; 
            else{
                this.vault[word] = {ups: title.ups, occ: 1};
            }
        });
    }

    onlyAlphabetic(word){
        // Delete all non-alphabetic characters from word
        return word.replace(/[^0-9a-z]/gi, '');
    }
}