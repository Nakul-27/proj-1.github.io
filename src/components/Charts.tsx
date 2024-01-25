import React, { RefObject, useEffect, useState } from "react";
import * as d3 from "d3";
import { DSVParsedArray } from "d3";

type Data = { 
    date: Date | null;
    open: number;
    high: number;
    low: number;
    close: number;
    adjclose: number;
    volume: number;
};

const url = process.env.PUBLIC_URL + '/assets/BTC-USD.csv';

const Charts = () => {
        const refBar: RefObject<HTMLDivElement> = React.createRef();
        const refCandle: RefObject<HTMLDivElement> = React.createRef();

        const [data, setData] = useState<DSVParsedArray<Data>>();

        useEffect(() => {
                console.log("Loading Data");
                d3.dsv(",", url, (d) => {
                        return {
                            // Date,Open,High,Low,Close,AdjClose,Volume
                            date: d3.timeParse("%Y-%m-%d")(d.Date),
                            open: +d.Open,
                            high: +d.High,
                            low: +d.Low,
                            close: +d.Close,
                            adjclose: +d.AdjClose,
                            volume: +d.Volume,
                        };
                    }).then((data) => {
                        setData(data);
                        console.log("Data Loaded");
                    });
            }, []);

        useEffect(() => {
                if (data) {
                    console.log("draw graph now!\n");
                    console.log(data);
                    d3.select(refBar.current).selectAll('*').remove();
                    d3.select(refCandle.current).selectAll('*').remove();
                    drawLine();
                    drawCandle();
                }
                else console.log("do not draw graph") 
            }, [data]);

        const drawLine = () => {
            console.log("Drawing the Graph Now");

            var filteredData = data?.filter(d => d.date != null) ?? [];

            // set the dimensions and margins of the graph
            var margin = {top: 50, right: 30, bottom: 30, left: 60},
                width = 920 - margin.left - margin.right,
                height = 800 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select(refBar.current)
              .append("svg")
                .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("style", "max-width: 100%; height: auto; height: intrinsic; font: 10px sans-serif;")
                .style("-webkit-tap-highlight-color", "transparent")
                .style("overflow", "visible")
                .on("pointerenter pointermove", pointermoved)
                .on("pointerleave", pointerleft)
                .on("touchstart", event => event.preventDefault())
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

            // Add X axis --> it is a date format
            var x = d3.scaleTime()
              .domain(d3.extent(
                  filteredData, (d) => d.date) as [Date, Date]
              )
              .rangeRound([ 0, width ]);

            svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));
    
            // Max value observed:
            const max = d3.max(filteredData, d => d.close)! + 10000;
            const min = d3.min(filteredData, d => d.close);

            // Add Y axis
            var y = d3.scaleLinear()
              .domain([0, max!])
              .rangeRound([ height, 0 ]);

            svg.append("g")
                // .attr("transform", `translate(${margin.left}, 0)`)
                .call(d3.axisLeft(y))          
                // .call(g => g.select(".domain").remove())
                .call(g => g.selectAll(".tick line").clone()
                    .attr("x2", width)
                    .attr("stroke-opacity", 0.1))
                .call(g => g.select(".tick:last-of-type text").clone()
                    .attr("x", 3)
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .style("font-size", "12px")
                    .text("↑ $"));

            svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 10 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .style("text-decoration", "underline")
                .text("Bitcoin Line Graph from 17 Jan 2023 to 17 Jan 2024")


            // Set the gradient
            svg.append("defs")
              .append("linearGradient")
              .attr("id", "line-gradient")
              .attr("gradientUnits", "userSpaceOnUse")
              .attr("x1", 0)
              .attr("y1", y(min!))
              .attr("x2", 0)
              .attr("y2", y(max!))
              .selectAll("stop")
                .data([
                  {offset: "0%", color: "blue"},
                  {offset: "100%", color: "red"}
                ])
              .enter().append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });

            var line = d3.line<Data>()
                .defined(d => d != null)
                .x(d =>  x(d.date!))
                .y(d => y(d.close))

            // Bollinger Bands
            const N = 6;
            const K = 3;

            const bolValues = Float64Array.from(filteredData, d => d.close);

            const bolY = d3.scaleLog()
                .domain(d3.extent(
                    bolValues, (d) => d) as [number, number]
                )
                .rangeRound([ height, 0 ]);

            const bolLine = d3.line<number>()
                .defined((y, i) => filteredData[i].date! && !isNaN(y))
                .x((d, i) => x(filteredData[i].date!))
                .y(d => y(d) as number);

            // Bollinger Bands
            svg.append("g")
                .attr("fill", "none")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.4)
                //.attr("stroke-linejoin", "round")
                //.attr("stroke-linecap", "round")
                .selectAll()
                .data([bolValues, ...bollinger(bolValues, N, [-K, 0, K])])
                .join("path")
                    .attr("stroke", (d, i) => ["white", "green", "blue", "red"][i])
                    .attr("d", bolLine)

            // Add the line
            svg.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                // .attr("stroke", "url(#line-gradient)")
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("d", line);

            // TODO: Add Legend for the plots
            // TODO: State what N and K are
            
            function bollinger(values: Float64Array, N: any, K: number[]) {
              let i = 0;
              let sum = 0;
              let sum2 = 0;
              const bands = K.map(() => new Float64Array(values.length).fill(NaN));
              for (let n = Math.min(N - 1, values.length); i < n; ++i) {
                const value = values[i];
                sum += value; sum2 += value ** 2;
              }
              for (let n = values.length, m = bands.length; i < n; ++i) {
                const value = values[i];
                sum += value; sum2 += value ** 2;
                const mean = sum / N;
                const deviation = Math.sqrt((sum2 - sum ** 2 / N) / (N - 1));
                for (let j = 0; j < K.length; ++j) {
                  bands[j][i] = mean + deviation * K[j];
                }
                const value0 = values[i - N + 1];
                sum -= value0; sum2 -= value0 ** 2;
              }
              return bands;
            }

            // Create the tooltip container.
            const tooltip = svg.append("g");

            function formatValue(value: any) {
              return value.toLocaleString("en", {
                style: "currency",
                currency: "USD"
              });
            }
            
            function formatDate(date: any) {
              return date.toLocaleString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
              });
            }

            const eventDates = ["2023-03-10", "2023-04-15", "2023-12-14", "2024-01-10"];
            // Loop through the event dates and draw a line for each
            eventDates.forEach(function(dateString) {
                const eventDate = new Date(dateString);
                const eventDateX = x(eventDate); // Convert date to pixel position using your x scale

                svg.append("line") // Add a vertical line for each event date
                    .attr("x1", eventDateX)
                    .attr("x2", eventDateX)
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("stroke", "red")
                    .attr("stroke-width", 2)
                    .attr("class", "event-line");
            });

            var legend_keys = ["Close ($)", "Upper Band ($)","Moving Average ($)", "Lower Band ($)"];
            const colorScheme = ["black", "green", "blue", "red"];
            const opacities = [1, 0.6, 0.6, 0.6];

            // Calculate the legend's x and y position based on the size of the chart
            const legendWidth = 150;
            const legendHeight = legend_keys.length * 20 + 20;
            const legendX = width - margin.right - legendWidth;
            const legendY = height - margin.bottom - (legend_keys.length * 25) - 20; // Adjust to position above the x-axis

            // Define the legend group with a slight offset within the SVG for padding purposes
            const legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("transform", `translate(${legendX + 20}, ${legendY - legendHeight + 140})`)
                .attr("text-anchor", "start");

            // Add a rectangle for the legend background
            legend.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 1);

            // Add the legend title
            legend.append("text")
                .attr("x", legendWidth / 2)
                .attr("y", 10)
                .attr("text-anchor", "middle")
                .text("Legend");

            // Create legend items
            const legendItems = legend.selectAll(null)
                .data(legend_keys)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(10, ${18 + i * 20})`); // Offset each item within the legend group

            // Add colored rectangles for each legend item
            legendItems.append("rect")
                .attr("x", 0)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", (d, i) => colorScheme[i])
                .attr("opacity", (d, i) => opacities[i]);

            // Add legend text for each item
            legendItems.append("text")
                .attr("x", 24) // Offset to the right of the colored square
                .attr("y", 9.5)
                .attr("dy", "0.35em")
                .text(d => d);

            // var lineLegend = svg.append("g")
            //     .data(legend_keys)
            //     .attr("transform", (d, i) => {
            //             return "translate(" + width + "," + (i * 20) + ")";
            //         });

            // lineLegend.append("text").text( (d) => { return d; } )
            //     .attr("transform", "translate(15, 9)");

            // lineLegend.append("rect")
            //     .attr("fill", (d) => { return colorDict[d]; })
            //     .attr("width", 10)
            //     .attr("height", 10);
            
            // Add the event listeners that show or hide the tooltip.
            const bisect = d3.bisector((d: Data) => d.date).center;
            function pointermoved(event: Event) {
              const i = bisect(filteredData, x.invert(d3.pointer(event)[0]));
              tooltip.style("display", null);
              tooltip.attr("transform", `translate(${x(filteredData[i].date!)},${y(filteredData[i].close)})`);

              const path = tooltip.selectAll("path")
                .data([,])
                .join("path")
                  .attr("fill", "white")
                  .attr("stroke", "black");

              const text = tooltip.selectAll("text")
                .data([,])
                .join("text")
                .call(text => text
                  .selectAll("tspan")
                  .data([formatDate(filteredData[i].date!), formatValue(filteredData[i].close)])
                  .join("tspan")
                    .attr("x", 0)
                    .attr("y", (_, i) => `${i * 1.1}em`)
                    .attr("font-weight", (_, i) => i ? null : "bold")
                    .text(d => d));

              size(text, path);
            }

            function pointerleft() {
              tooltip.style("display", "none");
            }

            // Wraps the text with a callout path of the correct size, as measured in the page.
            function size(text: any, path: any) {
              const { x, y, width: w, height: h } = text.node().getBBox(); 
              text.attr("transform", `translate(${-w / 2},${15 - y})`);
              path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
            }

        }

        const drawCandle = () => {
            console.log("Drawing Candlestick Graph Now");
            
            // Max value observed:
            const max = 55000;

            // filteredData
            var filteredData = data?.filter(d => d.date != null) ?? [];

            // set the dimensions and margins of the graph
            var margin = {top: 50, right: 30, bottom: 30, left: 60},
                width = 920 - margin.left - margin.right,
                height = 800 - margin.top - margin.bottom;

            var svg = d3.select(refCandle.current)
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .on("pointerenter pointermove", pointermoved)
                .on("pointerleave", pointerleft)
                .on("touchstart", event => event.preventDefault())
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");
            
            svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .style("text-decoration", "underline")
                .text("Bitcoin Candle Chart from 17 Jan 2023 to 17 Jan 2024");

            // Add X axis --> it is a date format
            var x = d3.scaleTime()
              .domain(d3.extent(
                  filteredData, (d) => d.date) as [Date, Date]
              )
              .range([ 0, width ]);

            svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

            var y = d3.scaleLinear()
              // .domain([0, d3.max(data, function(d) { return +d.open; })])
              .domain([0, max])
              .range([ height, 0 ]);

            svg.append("g")
              .call(d3.axisLeft(y))
              .call(g => g.selectAll(".tick line").clone()
                  .attr("x2", width)
                  .attr("stroke-opacity", 0.1))
              .call(g => g.select(".tock:last-of-type text").clone()
                  .attr("x", 3)
                  .attr("text-anchor", "start")
                  .attr("font-weight", "bold")
                  .text("↑ Daily close ($)"));

            const g = svg.append("g")
                .attr("stroke-linecap", "round")
                .attr("stroke", "black")
            .selectAll("g")
            .data(filteredData)
            .join("g")
                .attr("transform", d => `translate(${x(d.date!)}, 0)`);

            g.append("line")
                .attr("y1", d => y(d.low))
                .attr("y2", d => y(d.high));

            g.append("line")
                .attr("y1", d => y(d.open))
                .attr("y2", d => y(d.close))
                .attr("stroke-width", 2)
                .attr("stroke", d => d.open > d.close ? d3.schemeSet1[0]
                    : d.close > d.open ? d3.schemeSet1[2]
                    : d3.schemeSet1[8]);

            // Create the tooltip container.
            const tooltip = svg.append("g");

            function formatValue(value: any) {
              return value.toLocaleString("en", {
                style: "currency",
                currency: "USD"
              });
            }
            
            function formatDate(date: any) {
              return date.toLocaleString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
              });
            }
            
            // Add the event listeners that show or hide the tooltip.
            const bisect = d3.bisector((d: Data) => d.date).center;
            function pointermoved(event: Event) {
              const i = bisect(filteredData, x.invert(d3.pointer(event)[0]));
              tooltip.style("display", null);
              tooltip.attr("transform", `translate(${x(filteredData[i].date!)},${y(filteredData[i].close)})`);

              const path = tooltip.selectAll("path")
                .data([,])
                .join("path")
                  .attr("fill", "white")
                  .attr("stroke", "black");

              const text = tooltip.selectAll("text")
                .data([,])
                .join("text")
                .call(text => text
                  .selectAll("tspan")
                  .data([formatDate(filteredData[i].date!), formatValue(filteredData[i].close)/*, formatValue(filteredData[i].open), formatValue(filteredData[i].high), formatValue(filteredData[i].low)*/])
                  .join("tspan")
                    .attr("x", 0)
                    .attr("y", (_, i) => `${i * 1.1}em`)
                    .attr("font-weight", (_, i) => i ? null : "bold")
                    .text(d => d));

              size(text, path);
            }

            function pointerleft() {
              tooltip.style("display", "none");
            }

            // Wraps the text with a callout path of the correct size, as measured in the page.
            function size(text: any, path: any) {
              const { x, y, width: w, height: h } = text.node().getBBox(); 
              text.attr("transform", `translate(${-w / 2},${15 - y})`);
              path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
            }

            var legend_keys = ["Closing Price ($) > Opening Price ($)", "Closing Price ($) < Opening Price ($)"];
            const colorScheme = ["green", "red"];
            const opacities = [1, 1];

            // Calculate the legend's x and y position based on the size of the chart
            const legendWidth = 220;
            const legendHeight = legend_keys.length * 20 + 20;
            const legendX = width - margin.right - legendWidth;
            const legendY = height - margin.bottom - (legend_keys.length * 25) - 20; // Adjust to position above the x-axis

            // Define the legend group with a slight offset within the SVG for padding purposes
            const legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("transform", `translate(${legendX + 20}, ${legendY - legendHeight + 90})`)
                .attr("text-anchor", "start");

            // Add a rectangle for the legend background
            legend.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 1);

            // Add the legend title
            legend.append("text")
                .attr("x", legendWidth / 2)
                .attr("y", 10)
                .attr("text-anchor", "middle")
                .text("Legend");

            // Create legend items
            const legendItems = legend.selectAll(null)
                .data(legend_keys)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(10, ${18 + i * 20})`); // Offset each item within the legend group

            // Add colored rectangles for each legend item
            legendItems.append("rect")
                .attr("x", 0)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", (d, i) => colorScheme[i])
                .attr("opacity", (d, i) => opacities[i]);

            // Add legend text for each item
            legendItems.append("text")
                .attr("x", 24) // Offset to the right of the colored square
                .attr("y", 9.5)
                .attr("dy", "0.35em")
                .text(d => d);


        }

        // const eventDates = ["2023-03-10", "2023-04-15", "2023-12-14", "2024-01-10"];

        return (
            <div>
                <div className=".barChart" ref={refBar}> </div>
                <p>
                    The vertical red lines represent major events that happened.
                    In order, they are:
                    <p>
                        <em>10 March 2023 </em>- Start of Traditional banking System Failures (ex: Silvergate underwent voluntary liquidation)
                    </p>
                    <p>
                        <em>15 April 2023</em> - End of Traditional Banking System Failures
                    </p>
                    <p>
                        <em>14 December 2023</em> - new FASB Accounting Rules for Bitcoin
                    </p>
                    <p>
                        <em>10 January 2024</em> - Chair of SEC Announces formal approval of Bitcoin ETF
                    </p>
                </p>
                <br></br>
                <div className=".candleChart" ref={refCandle}> </div>
            </div>
        );
    }

export default Charts;
