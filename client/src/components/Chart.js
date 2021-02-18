import React, {Component} from 'react'
import axios from 'axios'
import moment from 'moment'
import Chart from "chart.js";

// const fName = (symbol) => {
//     let fN = '';
//     switch (symbol) {
//         case "BTC":
//             fN = "Bitcoin";
//             break;
//         case "ETH":
//             fN = "Ethereum";
//             break;
//         case "LTC":
//             fN = "Litecoin";
//             break;
//         case "LINK":
//             fN = "Chainlink";
//             break;
//         case "EOS":
//             fN = "EOS";
//             break;
//         case "XRP":
//             fN = "XRP";
//             break;
//         case "OMG":
//             fN = "OMG Network";
//             break;
//         case "BCH":
//             fN = "Bitcoin Cash";
//             break;
//         case "TRX":
//             fN = "TRON";
//             break;
//         case "JST":
//             fN = "JUST";
//             break;
//
//     }
//     return fN;
// }
const formatMoney = (number, decPlaces, decSep, thouSep) => {
    var sign = number < 0 ? "-" : "";
    var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    var j = (j = i.length) > 3 ? j % 3 : 0;

    return sign +
        (j ? i.substr(0, j) + thouSep : "") +
        i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
}



export class LineGraph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            times: [],
            prices: [],
            pRs: [],
            pBCs: [],
            articles: []
        }
    }

    chartRef = React.createRef();

    async componentDidMount() {
        console.log('coinname:', this.props.coinName)

        let articleHash = {}

        let articleGet = `https://newsapi.org/v2/everything?q=${this.props.coinName}&apiKey=1b4fa439d5b04275a60ab73d2a80dfba&domains=decrypt.co,cointelegraph.com,coindesk.com&language=en&sortBy=relevancy`;
        try {
            const articles = await axios.get(articleGet)
            const parsed = articles.data.articles;
            for (let i = 0; i < parsed.length; i++) {
                if (articleHash[moment(parsed[i].publishedAt).format('YYYY-MM-DD')]) {
                    // console.log('triggered')
                    articleHash[moment(parsed[i].publishedAt).format('YYYY-MM-DD')] += 1;
                } else {
                    articleHash[moment(parsed[i].publishedAt).format('YYYY-MM-DD')] = 1;
                }
            }

            this.setState({articles: parsed})
        } catch (e) {
            console.log(e)
        }

        let pricesGet = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${this.props.coinName}&tsym=USD&limit=30&api_key=790056f1184b84f5b7cc92c3e0bde7d7362f02563fb4899d9b763f436795fe55`;
        try {
            const articles = await axios.get(pricesGet)
            const parsed = articles.data.Data.Data;

            console.log(articleHash);
            // for (let i = 0; i < articleArr.length; i++) {
            //     if (published )
            //     console.log(articleArr[i])
            // }

            for (let i = 0; i < parsed.length; i++) {
                if (articleHash[moment.unix(parsed[i].time).format('YYYY-MM-DD')] > 0 && articleHash[moment.unix(parsed[i].time).format('YYYY-MM-DD')] < 2) {
                    console.log('sweet')
                    this.setState({
                        times: [...this.state.times, moment.unix(parsed[i].time).format('YYYY-MM-DD')],
                        prices: [...this.state.prices, parsed[i].close],
                        pRs: [...this.state.pRs, 2 ** articleHash[moment.unix(parsed[i].time).format('YYYY-MM-DD')]],
                        pBCs: [...this.state.pBCs, 'orange']
                    })
                } else if (articleHash[moment.unix(parsed[i].time).format('YYYY-MM-DD')] > 1) {
                    console.log('too high')
                    this.setState({
                        times: [...this.state.times, moment.unix(parsed[i].time).format('YYYY-MM-DD')],
                        prices: [...this.state.prices, parsed[i].close],
                        pRs: [...this.state.pRs, 9],
                        pBCs: [...this.state.pBCs, 'red']
                    })
                } else {
                    this.setState({
                        times: [...this.state.times, moment.unix(parsed[i].time).format('YYYY-MM-DD')],
                        prices: [...this.state.prices, parsed[i].close],
                        pRs: [...this.state.pRs, 1],
                        pBCs: [...this.state.pBCs, 'green']
                    })
                }
            }
        } catch (e) {
            console.log(e)
        }


        let arties = this.state.articles;

        // console.log('arties', arties)

        const myChartRef = this.chartRef.current.getContext("2d");

        const chart = new Chart(myChartRef, {
            type: 'line',
            data: {
                labels: this.state.times,
                datasets: [{
                    label: this.props.coinName,
                    data: this.state.prices,
                    pointRadius: this.state.pRs,
                    borderColor: this.state.pBCs
                }],
            },
            options: {
                events: ["click", "mousemove"],
                // elements: {
                //     point: {
                //         radius: 5,
                //         hoverRadius: 10,
                //     },
                // },

                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function (value, index, values) {
                                console.log('value', formatMoney(value, 2, '.', ','))
                                return '$' + formatMoney(value, value > 9999 ? 0 : 2, '.', ',');
                            }
                        }
                    }]

                },

                tooltips: {
                    callbacks: {
                        label: (item) => `${chart.data.datasets[0].label}: $${formatMoney(item.value, item.value > 9999 ? 0 : 2, '.', ',')}`
                    },
                    enabled: false,
                    custom: function (tooltipModel) {
                        // Tooltip Element
                        var tooltipEl = document.getElementById('chartjs-tooltip');


                        // Create element on first render
                        if (!tooltipEl) {
                            tooltipEl = document.createElement('div');
                            tooltipEl.id = 'chartjs-tooltip';
                            tooltipEl.innerHTML = '<table></table>';
                            document.body.appendChild(tooltipEl);
                        }

                        // Hide if no tooltip
                        if (tooltipModel.opacity === 0) {
                            // tooltipEl.style.opacity = 0;
                            return;
                        }

                        // Set caret Position
                        tooltipEl.classList.remove('above', 'below', 'no-transform');
                        if (tooltipModel.yAlign) {
                            tooltipEl.classList.add(tooltipModel.yAlign);
                        } else {
                            tooltipEl.classList.add('no-transform');
                        }

                        function getBody(bodyItem) {
                            return bodyItem.lines;
                        }

                        // Set Text
                        if (tooltipModel.body) {
                            var titleLines = tooltipModel.title || [];
                            var bodyLines = tooltipModel.body.map(getBody);

                            var innerHtml = '<thead>';

                            // Articles


                            titleLines.forEach(function (title) {
                                for (let i = 0; i < arties.length; i++) {
                                    // console.log(moment(arties[i].publishedAt).format('YYYY-MM-DD'));
                                    if (title === moment(arties[i].publishedAt).format('YYYY-MM-DD')) {
                                        console.log('match')
                                        innerHtml += '<tr style="border-top: 1px solid #d0d0d0;"><th position=relative style="background-color: transparent;">' + `<a href=${arties[i].url} target="_blank"><img src="${arties[i].urlToImage}"; position=absolute; width="100px" style="padding-right: 10px;"/></a>` + '</th><td>' + `<a href=${arties[i].url} target="_blank" style="line-height: 1">${arties[i].title}</a>` + `<p>${arties[i].source.name}</p>` + '</td></tr>';

                                    }

                                }
                            });
                            innerHtml += '</thead><tbody>';

                            bodyLines.forEach(function (body, i) {

                                var colors = tooltipModel.labelColors[i];
                                var style = 'background:' + colors.backgroundColor;
                                style += '; border-color:' + colors.borderColor;
                                style += '; border-width: 2px';
                                var span = '<span style="' + style + '"></span>';
                                innerHtml += '<tr><td>' + span + body + '</td></tr>';
                            });
                            innerHtml += '</tbody>';

                            var tableRoot = tooltipEl.querySelector('table');
                            tableRoot.innerHTML = innerHtml;
                        }

                        // `this` will be the overall tooltip
                        var position = this._chart.canvas.getBoundingClientRect();

                        // Display, position, and set styles for font
                        tooltipEl.style.opacity = 1;
                        tooltipEl.style.width = 'auto';
                        tooltipEl.style.maxWidth = '300px'
                        tooltipEl.style.backgroundColor = "rgba(255,255,255,0.7)";
                        tooltipEl.style.position = 'absolute';

                        if (tooltipModel.caretX > window.innerWidth / 2) {
                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX-100 + 'px';
                            tooltipEl.style.textAlign = 'right';
                        } else {
                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                            tooltipEl.style.textAlign = 'left';
                        }
                        // console.log(tooltipEl.style);


                        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                        tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
                        tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
                        tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
                        tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                    }
                }
            },


        });

    }

    render() {
        return (
            <div>
                {this.state.times ?
                    <canvas
                        id="myChart"
                        ref={this.chartRef}
                    />
                    : null}

            </div>
        )
    }
}
