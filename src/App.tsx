import React, { useEffect, useRef } from 'react';
// import { useCSVDownloader } from 'react-papaparse';
import * as d3 from 'd3';
import BarChart from "./components/BarChart";

// import useReadCSV from './ReadCSV';
import './App.css';


function App () {
    const ref = useRef<SVGSVGElement>(null);

    // const csvData: Promise<any> = useReadCSV("../assets/BTC-USD.csv")
    //             .then(data => { console.log(data) })
    //             .catch(error => { console.log(error) });

    // const buildGraph = (data: Array<number>) => {
    //     const width = 200,
    //           scaleFactor = 10,
    //           barHeight = 20;

    //     const graph = d3.select(ref.current)
    //         .attr("width", width)
    //         .attr("height", barHeight * data.length);


    //     const bar = graph.selectAll("g")
    //         .data(data)
    //         .enter()
    //         .append("g")
    //         .attr("transform", function(d, i) {
    //                 return "translate(0," + i * barHeight + ")";
    //                 });

    //     bar.append("rect")
    //         .attr("width", function(d) {
    //                 return d * scaleFactor;
    //                 })
    //         .attr("height", barHeight - 1);

    //     bar.append("text")
    //         .attr("x", function(d) { return (d*scaleFactor); })
    //         .attr("y", barHeight / 2)
    //         .attr("dy", ".35em")
    //         .text(d => d);
    // }

    // useEffect(() => { }, []);

    return (
        <div className='App'> 
            <h1>D3 in React with Typescript</h1>
            <p>Finally go the data loading to work.</p>
            <p></p>
            <BarChart />
        </div>
    );

    // return (
    //     <div className="svg">
    //       <div>
    //           <svg className="container" ref={ref} width='100' height='100'></svg>
    //       </div>
    //     </div>
    // );
}

export default App;
