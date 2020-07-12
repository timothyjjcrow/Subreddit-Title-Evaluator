'use strict';

class ScraperConfig extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            subredditName: 'all',
            postCount: 100,
            wordData: null,
            responseInfo: '',
            scrapeDisabled: false,
            loadingElipsis: '',
        }

    }

    handleSubredditNameChange(e){
        this.setState({subredditName: e.target.value, responseInfo: ''})
    }

    handlePostCountNameChange(e){
        let val = e.target.value;
        this.setState({postCount: val, responseInfo: ''})
    }

    async handleScrapeInit(){
        if(this.state.subredditName.length === 0){
            this.setState({responseInfo: 'Subreddit cannot be empty'});
            return;
        }
        // Disable scrape trigger until fetch completed
        // Start loading ellipsis interval
        this.generateEllipsis = setInterval(() => {
            this.setState(prevState => ({loadingElipsis: prevState.loadingElipsis.length > 2 ? '' : prevState.loadingElipsis + '.'}))
        }, 500)
        this.setState({scrapeDisabled: true});
        let response = await fetch(`/scrape/${this.state.subredditName}/${this.state.postCount}`)
        if(response.status !== 200){
            let error = await response.text();
            this.setState({responseInfo: error, scrapeDisabled: false})
        } else{
            let data = await response.json();
            this.setState({wordData: data.reverse(), scrapeDisabled: false})
        }
        // Clear loading ellipsis interval
        clearInterval(this.generateEllipsis);
        this.setState({loadingElipsis: ''});
    }

    getLoadingText(){
        return '   scraping' + this.state.loadingElipsis;
    }

    render(){
        return(
            <div>
                <div className="infoWrapper">
                    <h1>This is titleScraper</h1>
                    <p>Enter a subreddit name and a number of posts to scrape.</p>
                    <p>When you press <b>Scrape</b>, the bot will scrape <b>{this.state.postCount}</b> posts from the subreddit: <b>r/{this.state.subredditName}</b></p>
                    <p>The bot searches the title of each post, counts how often each word occurs, and scores each word based on upvotes.</p>
                    <p>The table is sorted by <b>upvotes</b>, showing the most successful words on <b>r/{this.state.subredditName}</b></p>
                </div>
                <div className="formItem">
                    <label>Subreddit Name</label>
                    <input
                        className="formInput"
                        value={this.state.subredditName}
                        onChange={(e) => this.handleSubredditNameChange(e)}
                    >
                    </input>
                </div>
                <div className="formItem">
                    <label># Posts to Scrape</label>
                    <input
                        className="formInput"
                        min="1" 
                        max="10000"
                        step="1"
                        type="number"
                        value={this.state.postCount}
                        onChange={(e) => this.handlePostCountNameChange(e)}
                    ></input>
                </div>
                <div className="formItem scrapeButton">
                    <button className="formButton" disabled={this.state.scrapeDisabled} onClick={()=> this.handleScrapeInit()}>Scrape!</button>
                    {
                        this.state.scrapeDisabled ?
                        this.getLoadingText() : null
                    }
                </div>
                <div className="formItem" style={{color: "red"}}>
                    {this.state.responseInfo}
                </div>

                {this.state.wordData ?
                    <table className="dataTable">
                        <thead>
                            <tr>
                                <th className="tableColumn"></th>
                                <th className="tableColumn">Word</th>
                                <th className="tableColumn">Occurrences</th>
                                <th className="tableColumn">Total Upvotes</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.wordData.map((wordPoint,idx) => {
                            return (
                                <tr className="tableColumn" key={wordPoint.word}>
                                    <td>#{idx + 1}</td>
                                    <td>{wordPoint.word}</td>
                                    <td>{wordPoint.occ}</td>
                                    <td>{wordPoint.ups}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                    : null
                }
            </div>
        )
    }
}

const domContainer = document.querySelector('#react_root');
ReactDOM.render(<ScraperConfig />, domContainer);