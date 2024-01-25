import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Charts from "./components/Charts";

import './App.css';


function App () {
    const ref = useRef<SVGSVGElement>(null);
    return (
        <div className='App'> 
            <h1>Visualizing the Volatility of Bitcoin</h1>
            <h5>
                <div>By: Nakul Rao</div>
                <a href="mailto: nakul.rao@westpoint.edu">nakul.rao@westpoint.edu</a>
                <div>714.402.7667</div>
            </h5>
            <p>
                Bitcoin has been in the news a number of times in recent memory. 
                Most recently for the chairman of the SEC announcing the approval of "Spot Bitcoin Exchange-Traded Products" or an ETF (
                <a href="https://www.sec.gov/news/statement/gensler-statement-spot-bitcoin-011023">article here</a>
                ).
                While its price has increased overtime, the question remains as to whether the cryptocurrency will replace the dollar at somepoint.
                I believed that a good way to explore this would be through volatility. People and governments want a stable currency, and while that is by no means the only metric that dictates what could replace the dollar, I believe that it's something to consider. 
                <b>Therefore, my hypothesis is that while Bitcoin will rise in price overall, it will remain volatile in nature.</b>
            </p>
            <p>
                The data that we have is from 
                <a href="https://finance.yahoo.com/quote/BTC-USD/history/?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAAHM73eGsl_4gVstNhG1rBI-dBxfDk4JiV0oMRk64nPZZwfdsy4PiJBbIcDarauJXJrTL2WO0IwRGxiCb2j3BD17aXDBc7X68ad1f9ujNxzGkhaB3rGc6Er5bXQc869CQ9le1155OHExMxGN5K55AIGdILcSX-uEbd4k7HmMCggf-"> Yahoo Finane on "Bitcoin USD." </a>
                The data contains information on date, opening price, high price, low price, and closing price.
            </p>
            <p>
                From a univariate perspective, I chose to visualize this as a simple line chart.
                There are additional 
                <a href="https://en.wikipedia.org/wiki/Bollinger_Bands"> Bollinger Bands </a>
                around the line chart, as they are a type of statistical chart that characterize the prices and volatility over time.
                The "Upper Band," "Moving Average," and "Lower Band" are all derived from the closing price.
                <em> Note: The line chart and bollinger bands are all univariate, just superimposed on top of eachother to be able to visualize the volatility.</em>
            </p>
            <p>
                From a bivariate perspetive, I chose to create a 
                <a href="https://en.wikipedia.org/wiki/Candlestick_chart"> Candlestick Chart. </a>
                This chart portrays the relationship between the opening, closing, high, and low price for a given day.
            </p>
            <Charts />
            <h1>
                Thank you much for reading, hope you enjoyed!
            </h1>
        </div>
    );
}

export default App;
