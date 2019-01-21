import React, { Component } from 'react';
import logo from '../logo.png';
import logowhite from '../logo-white.png';
import logout from '../logout.png';
import '../App.css';
import { Link } from "react-router-dom";
import {Doughnut,  Bar} from 'react-chartjs-2';

import Button from '@material-ui/core/Button';
import apiConfig from '../constants/config';
import Calendar from 'react-calendar';

// import DatePicker from "react-datepicker";
import DatePicker from 'react-date-picker';
 
import "react-datepicker/dist/react-datepicker.css";

class Header extends Component{
    
    render() {
        return(
            <div style={{display: 'flex', flexDirection: 'row', height: 40, alignItems: 'center', justifyContent: 'space-between', padding: '0px 10px'}}>
                <img src={logowhite} style={{height: 32,}}></img>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <label style={{color: 'white', marginRight: 10}}>Welcome {this.props.payload.email}</label>
                    <button
                        style={{backgroundColor: 'transparent', borderStyle: 'none'}}
                        onClick={this.props.onLogout}
                    >
                        <img src={logout} style={{height: 24}}></img>
                    </button>
                </div>
            </div>
        )
    }
}

class Today extends Component{
    state={
        score: 0,
    }

    componentDidMount() {
        let now = new Date();

        let month = now.getMonth() + 1;
        month = month < 10 ? '0' + month : month;
        let day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
        let year = now.getFullYear();

        let date = year + '-' + month + '-' + day;

        fetch(`${apiConfig.server}${'/getbites'}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.props.payload._id,
                date,
            })
        })
        .then((res) => res.json())
        .then(res => {
            let score = 0;
            res.map(i => {
                score = score + i.point;
            })
            this.setState({score});
        })
        .catch(() => {
        });
    }
    render() {
        const data = {
            datasets: [{
                data: this.props.hungry,
                backgroundColor: [
                    '#ec2359',
                    'grey',
                ],
                hoverBackgroundColor: [
                    '#ec2359',
                    'grey',
                ],
            }],
            labels: [
                'Yes',
                'No',
            ],
        };
        return(
            <div style={{display: 'flex', height: '32vh', backgroundColor: 'white'}}>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%', alignItems: 'center',}}>
                    <label>Today's Bite Score</label>
                    <div style={{display: 'flex', width: 150, height: 150, borderRadius: 75, backgroundColor: '#ec2359', justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
                        <label style={{fontSize: 72, color: 'white'}}>{this.state.score}</label>
                    </div>
                </div>
                <div style={{display: 'flex', width: '50%', justifyContent: 'center', alignItems: 'center',}}>
                    <div style={{width: 200, height: 200, }}>
                        <Doughnut
                            options={{
                                maintainAspectRatio: false,
                                legend: {
                                    display: false,
                                },
                                borderWidth: 20,
                                rotation: 0.75 * Math.PI,
                                title: {
                                    display: true,
                                    text: 'Were You Hungry?',
                                    fontSize: 18
                                }
                            }}
                            data={data}
                        />
                    </div>
                    {
                        this.props.hungry && this.props.hungry.length > 1 ?
                        <div>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '20px 0px'}}>
                                <div style={{width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#ec2359', marginRight: 10}}></div>
                                <label>Yes - {Math.round(this.props.hungry[0] / (this.props.hungry[0] + this.props.hungry[1]) * 100)}%</label>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <div style={{width: 15, height: 15, borderRadius: 7.5, backgroundColor: 'grey', marginRight: 10}}></div>
                                <label>No - {Math.round(this.props.hungry[1] / (this.props.hungry[0] + this.props.hungry[1]) * 100)}%</label>
                            </div>
                        </div>
                        :
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '20px 0px'}}>
                            <div style={{width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#ec2359', marginRight: 10}}></div>
                            <label>Yes - 100%</label>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

class Graph extends Component{

    constructor(props) {
        super(props);
        this.drawGraph = this.drawGraph.bind(this);
        this.getBites = this.getBites.bind(this);
    }

    state={
        month: 0,
    }

    componentDidMount(){
        this.getBites(0);
    }

    getBites = (month) => {
        let now = new Date();
        
        month = month > 8 ? ++month : '0' + (++month);
        let yearmonth = now.getFullYear() + '-' + month;
        // let yearmonth = '2018' + '-' + month;

        fetch(`${apiConfig.server}${'/getbites'}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.props.payload._id,
                yearmonth,
            })
        })
        .then((res) => res.json())
        .then(res => {
            if(res.length === 0) {
                this.drawGraph(null);
                this.props.handleBites([], [1]);
                return;
            }

            res.sort(function(b,a) {
                return new Date(a.date) - new Date(b.date);
            })

            let bites = [];
            let point = 0;
            let date = res[0].date;
            let lastDate;
            let hungryYes = 0;
            let hungryNo = 0;
            let hungry = [];
            res.map((i, index) => {
                if(i.hungry == "No")
                    hungryYes++;
                else
                    hungryNo ++;

                if(date !== i.date) {
                    bites.push({"date":date, "point": point});
                    point = 0;
                    date = i.date;
                }
                lastDate = i.date;
                point = point + i.point;
            })

            bites.push({"date": lastDate, "point":point});

            hungry.push(hungryNo, hungryYes);

            let missingDates = [];
            let now = new Date(yearmonth);
            let days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for(let i = 1; i <= days; i++ ){
                let missingDate = true;
                for(let bite of bites) {
                    if(bite.date.slice(-2) == i){
                        missingDate = false;
                        break;
                    }
                }
                if(missingDate) {
                    let month = now.getMonth() + 1;
                    month = month < 10 ? '0' + month : month;
                    let day = i < 10 ? '0' + i : i;
                    let year = now.getFullYear();
                    let date = year + '-' + month + '-' + day;
                    missingDates.push({"date": date, "point": null});
                }
            }
            bites = [...missingDates, ...bites];
            bites.sort(function(a,b) {
                return new Date(a.date) - new Date(b.date);
            })
            this.drawGraph(bites);
            this.props.handleBites(res, hungry);
        })
        .catch((err) => {
        }); 
    }

    drawGraph = (bites) => {
        if(!bites) {
            this.setState({data: null});
            return;
        }

        let labels = [];
        let data = [];

        bites.map((value, index) => {
            labels.push(index + 1);
            data.push(value.point);
        })
        this.setState({data:{
            labels,
            datasets: [
            {
                backgroundColor: '#ec2359',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 1,
                hoverBackgroundColor: '#ec2359',
                hoverBorderColor: 'rgba(255,99,132,1)',
                data,
            }
            ],
        }});

    }

    render() {
        const months=['January','Febrary','March','April','May','June','July','August','September','October','November', 'December'];
        return(
            <div style={{display: 'flex', flexDirection: 'column', height: '32vh', padding: '0 5%', alignSelf: 'center', backgroundColor: '#e1e1e1',}}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0px',}}>
                    <button 
                        style={{backgroundColor: 'transparent', borderStyle: 'none', color: '#ec2359', fontWeight: 'bold', fontSize: 18}}
                        onClick={() => {
                            let month = this.state.month;
                            if(month > 0){
                                month --;
                                this.setState({month});
                                this.getBites(month);
                            }

                        }}
                    >{'<'}</button>
                    <label style={{width: 150, textAlign: 'center', fontSize: 24}}>{months[this.state.month]}</label>
                    <button
                        style={{backgroundColor: 'transparent', borderStyle: 'none', color: '#ec2359', fontWeight: 'bold', fontSize: 18}}
                        onClick={() => {
                            let month = this.state.month;
                            if(month < 11){
                                month ++;
                                this.setState({month});
                                this.getBites(month);
                            }
                        }}
                    >{'>'}</button>
                </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%',}}>
                    {
                        this.state.data ?
                        <Bar
                        data={this.state.data}
                        options={{
                                legend: {display: false},
                                scales: {
                                    yAxes: [{
                                        display: false,
                                        gridLines: {
                                            color: "rgba(0, 0, 0, 0)",
                                        },
                                        ticks: {
                                            beginAtZero:true
                                        }
                                    }],
                                    xAxes: [{
                                        gridLines: {
                                            color: "rgba(0, 0, 0, 0)",
                                        },
                                    }]
                                },
                                tooltips: {
                                    callbacks:{
                                        title: function(tooltipItem, data) {
                                            return tooltipItem[0].yLabel;
                                        },
                                        label: function(tooltipItem, data) {
                                            return null;
                                        },
                                    }
                                },
                                maintainAspectRatio: false,
                        }}
                        />
                        :
                        <label>No Entry</label>
                    }
                </div>
            </div>
        )
    }
}

class Detail extends Component{
    render() {
        const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec'];
        return(
            <div style={{display: 'flex', flexDirection: 'column', height: '32vh', overflowX: 'scroll',}}>
                <label style={{alignSelf: 'center', color: 'white', fontSize: 18, margin: '10px 0px'}}>My 30 Day Feed</label>
                {
                    this.props.bites.length ?
                    <div style={{display: 'flex', marginRight: 10, alignItems: 'center', height: '100%', }}>
                        {
                            this.props.bites.map((bite, index) => {
                                const comment = bite.comment;
                                const imageUri = bite.imageUri;
                                const time = bite.time;
                                const min = bite.min;
                                const _id = bite._id;
                                let date = bite.date;
                                let entryType = bite.entryType;
                                let food = bite.food;
                                let stomach = bite.stomach;
                                let snack = bite.snack;
                                let beverage = bite.beverage;
                                let hungry = bite.hungry;
                                let point = bite.point;
                                return(
                                    <div style={{minWidth: 220, height: 270, borderRadius: 25, padding: "10px", margin: "0px 10px", backgroundColor: 'white'}}>
                                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <label style={{color: 'red'}}>{months[parseInt(date.slice(5, 7)) - 1]} {date.slice(-2)}, {date.slice(0 ,4)}</label>
                                            <label style={{color: 'red'}}>{time % 12 === 0 ? 12 : time % 12}:{min < 2 ? '0' + min * 5 : min * 5} {time < 12 ? "AM" : "PM"}</label>
                                        </div>
                                        {
                                            imageUri ?
                                            <div style={{display: 'flex', flexDirection: 'row', marginTop: 10 }}>
                                                <label style={{}}>Bites {point} / {entryType} / Hungry: {hungry ? hungry : 'Yes'}</label>
                                            </div>
                                            :
                                            <div style={{display: 'flex', height: '20vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                                                <label style={{}}>Bites {point}</label> 
                                                <label>{entryType}</label>
                                                <label>Hungry: {hungry ? hungry : 'Yes'}</label>
                                            </div>
                                        }
                                        {
                                            imageUri ?
                                            <img src={imageUri} style={{width: '100%', height: 200, borderRadius: 20, marginTop: 20}} alt="asdf"></img>
                                            :null
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    :
                    <div style={{display: 'flex', height: '100%', justifyContent: 'center'}}>
                        <label style={{alignSelf: 'center', color: 'white', fontSize: 18, margin: '10px 0px'}}>No Entry</label>
                    </div>
                }
            </div>
        )
    }

}

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.onLogout = this.onLogout.bind(this);
        this.handleBites = this.handleBites.bind(this);
    }

    state = {
        payload: this.props.history.location.state.payload,
        bites: null,
        hungry: null,
    }

    onLogout = () => {
        this.props.history.replace('/');
    }

    handleBites = (bites, hungry) => {
        this.setState({bites, hungry});
    }
    render() {
        return (
            <div style={{backgroundColor: '#ec2359', height: '100vh',}}>
                <Header payload={this.state.payload} onLogout={this.onLogout}/>
                <Today payload={this.state.payload} hungry={this.state.hungry} />
                <Graph payload={this.state.payload} handleBites={this.handleBites}/>
                {this.state.bites && <Detail bites={this.state.bites}/> }
            </div>
        );
    }
}

export default Dashboard;
