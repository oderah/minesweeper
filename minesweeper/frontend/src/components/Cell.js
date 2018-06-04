import React, { Component } from "react";

import "../../static/css/Cell.css";

var axios = require("axios");

class Cell extends Component {
    constructor(props) {
        super(props);

        this.state = {
            x: props.x,
            y: props.y,
            // style: "#8E9FB2",,
            style: "linear-gradient(to right, #fff, #8E9FB2)",
            text: "",
            flagged: false,
            boxShadow: "0px 0px 5px 0px",
            borderRadius: "50%",
            pointerEvents: "auto",
            hover: false,
            isOpen: false
        };
    }

    openCell = (i, j) => {
        var self = this;

        // open cell
        axios.post("http://127.0.0.1:8000/api/"+self.props.gs_id+"/", {"msg":"old","x":i, "y":j})
        .then(function(res) {

            // if cell was opened, reveal content
            if(res.data["msg"] != 1 && res.data["msg"] != 3) {

                self.open(res.data["closeBombs"]); // reveal content

                // open neighbours
                console.log("BIGOPEN >>> ", self.props.bigOpened());
                if(res.data["closeBombs"] == 0 && !self.props.bigOpened()) {
                    // self.openNeighbours().then(() => {
                    //     self.props.toggleBigOpen();
                    // }).catch(function(err){
                    //     console.log(err);
                    // });
                    (async () => {
                        await self.openNeighbours();
                        self.props.toggleBigOpen(true);
                    })();
                }

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
    };

    // this onClick function opens a cell
    clicked = () => {
        if(this.props.gameOn()) {
            this.openCell(this.state.x, this.state.y);
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

    // this function handles hover effects
    toggleHover = (e) => {
        if (!this.state.isOpen) {
            this.setState({
                hover: !this.state.hover,
            });
        }
    };

    // this function reveals the content of a cell
    open = (label) => {
        this.colors = {
            1: "aqua",
            2: "lime",
            3: "blue",
            4: "maroon",
            5: "purple",
            6: "yellow",
            7: "orange",
            8: "red",
        };

        this.setState({
            style: "",
            text: (label == 0)? '' : label,
            color: (label == "*") ? "magenta" : this.colors[label],
            boxShadow: "none",
            isOpen: true
        });
    }

    // this function returns a styling for the cell
    style = () => {
        // let this.transform = this.zIndex = this,bgColor = "";

        if (!this.state.isOpen) {
            this.transform = this.state.hover ? "scale(1.1)" : "scale(1)";
            this.zIndex = this.state.hover ? "20" : "0";
            // this.bgColor = this.state.hover ? "#fff" : this.state.style;
            this.opacity = this.state.hover ? "0.5" : "1";
        }

        // else {
        //     this.bgColor = this.state.style
        // }

        return {
            background: this.state.style,
            color: this.state.color,
            boxShadow: this.state.boxShadow,
            pointerEvents: this.state.pointerEvents,
            borderRadius: this.state.borderRadius,

            transform: this.transform,
            transitionDuration: !this.state.hover ? "0.3s" : "",
            zIndex: this.zIndex
            // backgroundColor: this.state.style
        };
    }

    // this function opens possible neighbours
    openNeighbours = () => {
        let x = this.state.x;
        let y = this.state.y;

        // cells to check
        var toCheck = [
            [x-1, y-1], [x-1, y], [x-1, y+1],
            [x, y-1], [x, y+1],
            [x+1, y-1], [x+1, y], [x+1, y+1]
        ]


        // only open valid cells
        for(var i = 0; i < toCheck.length; ++i) {
            if(this.isValid(toCheck[i][0], toCheck[i][1])) {
                this.props.openCell(toCheck[i][0], toCheck[i][1]);
            }
        }

        return 1;
    };

    // this function checks if the given coordinates are valid
    isValid = (x, y) => {
        return (x >= 0 && x <= this.props.boardWidth && y >= 0 && y <= this.props.boardWidth);
    };

    render() {
        return(
            <div className="cell container" style={this.style()} onClick={this.clicked} onContextMenu={this.rightClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
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
