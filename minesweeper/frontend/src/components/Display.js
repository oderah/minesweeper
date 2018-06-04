import React, { Component } from "react";

import "../../static/css/Display.css"

var axios = require("axios");

class Display extends Component {
    constructor(props) {
        super(props);


        this.state = {
            component: props.component,
            text: "",
            gs_id: props.gs_id,
            timerOn: false
        };
    }

    // get flagsLeft and elapsedTime from api
    componentDidMount() {
        var gs_id = this.state.gs_id;

        var self = this;
        axios.post("http://127.0.0.1:8000/api/"+gs_id+"/", {"msg":"get", "component":this.state.component})
        .then(function(res) {
            if(self.state.component == "FlagsLeft") {
                self.setState({
                    text: "Flags left:\t" + res.data["text"]
                });
            }
            else {
                console.log(self.state.timerOn);
                self.startTimer(res.data["text"]);
                console.log(self.state.timerOn);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    }

    // toggle for timerOn
    toggleTimer() {
        this.setState({
            timerOn: !this.state.timerOn
        });
    }

    // this function starts the timer
    startTimer(data) {
        // split data into hh, mm and ss for hours, minutes and seconds respectively
        let hh = 0, mm = 0, ss = 0;
        if(data > 60) {
            mm = parseInt(data / 60), ss = data % 60;
            if(mm > 60) {
                hh = parseInt(m / 60), mm %= 60;
            }
        }
        else ss = data;

        this.updateTime([hh, mm, ss]); // update time display
        this.toggleTimer(); // toggle timer on
        this.runTimer([hh, mm, ss]); // run timer
    }

    timerFunction(arr) {
        // increment time
        // arr[0] is hh, arr[1] is mm, arr[2] is ss
        if(++arr[2] >= 60) {
            arr[2] = 0;
            if(++arr[1] >= 60) {
                arr[1] = 0;
                arr[0]++;
            }
        }
        this.updateTime(arr); // update timer
        this.runTimer(arr); // run timer
    }

    // this function keeps the timer running while the timer and game are on
    runTimer(arr) {
        if(this.state.timerOn) {
            let self = this;

            // update timer every second
            self.timeOut = setTimeout(function(){self.timerFunction(arr)}, 1000);
        }
    }

    // this function updates the timer display component
    updateTime(arr) {
        var gs_id = this.state.gs_id;

        // if any of hh, mm or ss is less than 10, add a preceeding 0
        let hh = (arr[0] < 10)? "0" + arr[0]: arr[0],
        mm = (arr[1]< 10)? "0" + arr[1] : arr[1],
        ss = (arr[2] < 10)? "0" + arr[2] : arr[2];

        this.setState({
            text: hh + ":" + mm + ":" + ss
        });

        // update elapsedTime at api
        var elapsedTime = ((arr[0]*3600) + (arr[1]*60) + arr[2]);

        axios.post("http://127.0.0.1:8000/api/"+gs_id+"/", {"msg":"timeUpdate", "elapsedTime":elapsedTime}).then(function(res){
            // console.log(res.data);
        }).catch(function(err){
            console.log(err);
        });
    }

    // clear timeout
    componentWillUnmount() {
        this.timeout && clearTimeout(this.timeOut);
        this.timeout = false;
    }

    render() {
        return(
            <div className="display container">
                <p>{this.state.text}</p>
            </div>
        );
    }
}

export default Display;
