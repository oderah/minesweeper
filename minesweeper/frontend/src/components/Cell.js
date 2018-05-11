import React, { Component } from "react";

import "../../static/css/Cell.css";

var axios = require("axios");

class Cell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            x: props.x,
            y: props.y,
            style: "red",
            text: "",
            flagged: false
        };
    }

    // this onClick function opens a cell
    clicked = () => {
        if(this.props.gameOn()) {
            let i = this.state.x;
            let j = this.state.y

            var self = this;

            // open cell
            axios.post("http://127.0.0.1:8000/api/"+self.props.gs_id+"/", {"msg":"old","x":i, "y":j})
            .then(function(res) {

                // if cell was opened, reveal content
                if(res.data["msg"] != 1 && res.data["msg"] != 3) {

                    self.open(res.data["closeBombs"]); // reveal content

                    // if cell is a bomb
                    if(res.data["msg"] == 2) {

                        // GAME OVER!!! end game
                        self.props.endGame(res.data["closeBombs"], res.data["allBombs"]);
                    }

                    else if(res.data["msg"] == 0) {

                        // if no other non bomb cells left
                        if(res.data["isVictory"] == true) {

                            // VICTORY
                            self.props.winGame();
                        }
                    }
                }
            })
            .catch(function(err) {
                console.log(err);
            });
        }
    }

    // this contextMenu function flags or unflags a cell
    rightClicked = () => {
        if(this.props.gameOn()) {
            let self = this;

            // flag cell at api
            axios.post("http://127.0.0.1:8000/api/"+self.props.gs_id+"/", {"msg":"flag", "x":self.state.x, "y":self.state.y}).then(function(res) {
                if(res.data["msg"] == "done") {

                    // mark cell as flagged
                    self.setState({
                        flagged: !self.state.flagged
                    });

                    // update flagsLeft display component
                    self.props.updateFlags(res.data["flagsLeft"]);
                }
            }).catch(function(err) {
                console.log(err);
            });
        }
    }

    // this function reveals the content of a cell
    open = (label) => {
        this.setState({
            style: "grey",
            text: label
        });
    }

    // this function returns a styling for the cell
    style = () => {
        return {
            backgroundColor: this.state.style,
        };
    }

    render() {
        return(
            <div className="cell container" style={this.style()} onClick={this.clicked} onContextMenu={this.rightClicked}>
                <p>{this.state.text}</p>
                {this.state.flagged && (
                    <div id="flag" style={{width: "10px", height: "10px", backgroundColor: "black"}}>

                    </div>
                )}
            </div>
        );
    }
}

export default Cell
