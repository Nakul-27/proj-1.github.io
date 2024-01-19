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

const url = process.env.PUBLIC_URL + '/assets/BTC-USD.csv';;

const BarChart = () => {
        const ref: RefObject<HTMLDivElement> = React.createRef();

        const [data, setData] = useState<DSVParsedArray<Data>>();

        useEffect(() => {
                console.log("Loading Data");
                d3.dsv(",", url, (d) => {
                        const ddate: string = d.Date || "";
                        return {
                                // Date,Open,High,Low,Close,AdjClose,Volume
                                date: d3.timeParse("%Y-%m-%d")(ddate),
                                open:parseInt(d.Open),
                                high:parseInt(d.High),
                                low:parseInt(d.Low),
                                close:parseInt(d.Close),
                                adjclose:parseInt(d.AdjClose),
                                volume:parseInt(d.Volume),
                            };
                    }).then((data) => {
                        setData(data);
                        console.log("Data Loaded");
                    });
            }, []);

        useEffect(() => {
                if (!data) console.log("do not draw graph") 
                else { 
                    console.log("draw graph now!\n");
                    console.log(data);
                    draw();
                }
            }, [data]);

        const draw = () => {
            console.log("Drawing the Graph Now ?");
        }

        return (
            <div className=".barChart" ref={ref}>
            </div>
        );
    }

export default BarChart;
