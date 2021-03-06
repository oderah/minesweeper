import React, { Component } from "react";

// import { Link } from "react-router-dom";

import Display from "./Display";

import "../../static/css/ControlPanel.css"

class ControlPanel extends Component {
    // this function toggles the timer off
    stopTimer() {
        this.timer && this.timer.toggleTimer();
    }

    // this function updates the flagsLeft component
    updateFlags(flagsLeft) {
        this.flagsLeft && this.flagsLeft.setState({
            text: "Flags left:\t" + flagsLeft
        });
    }

    render() {
        return(
            <div id="ctrl" className="container">
                <ul>
                    <li><Display component="FlagsLeft" gs_id={this.props.gs_id} ref={(flags) => {this.flagsLeft = flags}} /></li>
                    <li>
                        <div style={{width: "40px", height: "40px"}}>
                            <img width="30px" height="30px" src="../../static/SVG/reset.svg" onClick={() => {this.props.history.push("/")}}/>
                        </div>
                    </li>
                    <li><Display component="Timer" gs_id={this.props.gs_id} ref={(t) => {this.timer = t}} /></li>
                </ul>
            </div>
        );
    };
}

export default ControlPanel;
// <li><Link to="/">NEW</Link></li>
// <li><button onClick={this.newGame}>NEW GAME</button></li>
