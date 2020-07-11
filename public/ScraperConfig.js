'use strict';

class ScraperConfig extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            subredditName: '',
            postCount: 100,
            wordData: null
        }

    }

    handleSubredditNameChange(e){
        this.setState({subredditName: e.target.value})
    }

    handlePostCountNameChange(e){
        this.setState({postCount: e.target.value})
    }

    async handleScrapeInit(){
        let response = await fetch(`/scrape/${this.state.subredditName}/${this.state.postCount}`)
        console.log('We got this response status: ', response.status);
        let data = await response.json();
        this.setState({wordData: data.reverse()})
    }

    render(){
        return(
            <div>
                <div>
                    <label>Subreddit Name</label>
                    <input
                        value={this.state.subredditName}
                        onChange={(e) => this.handleSubredditNameChange(e)}
                    >
                    </input>
                </div>
                <div>
                    <label># Posts to Scrape</label>
                    <input
                        type="number"
                        value={this.state.postCount}
                        onChange={(e) => this.handlePostCountNameChange(e)}
                    ></input>
                </div>
                <div>
                    <button onClick={()=> this.handleScrapeInit()}>Scrape Titles!</button>
                </div>

                {this.state.wordData ?
                    <table class="dataTable">
                        <tr>
                            <th>Word</th>
                            <th>Occurrences</th>
                            <th>Total Upvotes</th>
                        </tr>
                        {this.state.wordData.map(wordPoint => {
                            return (
                                <tr>
                                    <td>{wordPoint.word}</td>
                                    <td>{wordPoint.occ}</td>
                                    <td>{wordPoint.ups}</td>
                                </tr>
                            )
                        })}
                    </table>
                    : null
                }
            </div>
        )
    }
}

const domContainer = document.querySelector('#react_root');
ReactDOM.render(<ScraperConfig />, domContainer);