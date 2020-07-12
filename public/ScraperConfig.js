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
            timeFrame: "all",
            lastTimeFrame: null,
            lastSub: null
        }
    }
    handleOptionChange(e){
        this.setState({timeFrame: e.target.value})
    }

    handleSubredditNameChange(e){
        let sub = e.target.value.replace(/[^0-9a-z\_]/gi, '').trim();
        this.setState({subredditName: sub, responseInfo: ''})
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

        let response = await fetch(`/scrape/${this.state.subredditName}/${this.state.postCount}/${this.state.timeFrame}`);

        if(response.status !== 200){
            let error = await response.text();
            this.setState({responseInfo: error, scrapeDisabled: false})
        } else{
            let scrapedObject = await response.json();
            this.setState({
                wordData: scrapedObject.data.reverse(), 
                scrapeDisabled: false, 
                responseInfo: '',
                lastTimeFrame: scrapedObject.timeFrame,
                lastSub: scrapedObject.subreddit
            })
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
                    <h4>Created by <a href="https://timothycrowley.me">Tim Crowley</a></h4>
                    <p>Enter a subreddit name and a number of posts to scrape.</p>
                    <p>When you press <b>Scrape</b>, the bot will scrape <b>{this.state.postCount}</b> posts from the subreddit: <b>r/{this.state.subredditName}</b></p>
                    <p>The bot searches the title of each post, counts how often each word occurs, and scores each word based on upvotes.</p>
                    <p>The table is sorted by <b>upvotes</b>, showing the most successful words on <b>r/{this.state.subredditName}</b></p>
                </div>
                <div className="formItem">
                    <label className="formItemLabel">Subreddit Name:</label>
                    <input
                        className="formInput"
                        value={this.state.subredditName}
                        onChange={(e) => this.handleSubredditNameChange(e)}
                    >
                    </input>
                </div>
                <div className="formItem radioSelector"> 
                    <label className="formItemLabel">Top posts of: </label>
                    <div className="radio">
                        <label>
                            <input type="radio" value="hour" checked={this.state.timeFrame==="hour"} onChange={(e) => this.handleOptionChange(e)} />
                            hour
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input type="radio" value="day" checked={this.state.timeFrame==="day"} onChange={(e) => this.handleOptionChange(e)}/>
                            day
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input type="radio" value="week" checked={this.state.timeFrame==="week"} onChange={(e) => this.handleOptionChange(e)}/>
                            week
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input type="radio" value="month" checked={this.state.timeFrame==="month"} onChange={(e) => this.handleOptionChange(e)}/>
                            month
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input type="radio" value="year" checked={this.state.timeFrame==="year"} onChange={(e) => this.handleOptionChange(e)}/>
                            year
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input type="radio" value="all" checked={this.state.timeFrame==="all"} onChange={(e) => this.handleOptionChange(e)}/>
                            all
                        </label>
                    </div>
                </div>
                <div className="formItem">
                    <label className="formItemLabel"># Posts to Scrape:</label>
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
                    <div>
                        <div className="tableHeading">
                            <h4>Subreddit: {this.state.lastSub}</h4>
                            <h4>Timeframe: {this.state.lastTimeFrame}</h4>
                        </div>
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
                    </div>
                    : null
                }
            </div>
        )
    }
}

const domContainer = document.querySelector('#react_root');
ReactDOM.render(<ScraperConfig />, domContainer);