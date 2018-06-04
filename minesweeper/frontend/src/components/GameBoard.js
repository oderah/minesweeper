import React, { Component } from "react";

import ReactDom from "react-dom";

import { Route } from "react-router-dom";


import Cell from "./Cell";

import ControlPanel from "./ControlPanel";

import "../../static/css/GameBoard.css";

var axios = require("axios");

var _ = require("lodash");

var gameOn = false; // game control, true if game is running

var bigOpen = false; // determines if a big patch has been opened

var self; // ref to this

class GameBoard extends Component {
    constructor(props) {
        super(props);

        this.cellRefs = {}; // dict of refs to cells

        self = this;

        this.state = {
            gs_id: ""
        };

    }

    bigOpened = () => (bigOpen);

    toggleBigOpen = (toggle) => {
        let gs_id = this.state.gs_id;
        let data = {"msg":"bigOpen", "toggle":toggle};
        console.log("DATA ===> ", data);

        axios.post("http://127.0.0.1:8000/api/"+gs_id+"/", data)
        .then(function(res){
            bigOpen = toggle;
        })
        .catch(function(err){
            console.log(err);
        });
    };

    // this function returns a mapped array of cells
    getCells() {
        let cells = [];

        for(let i = 0; i < this.props.numCells; ++i) {
            for(let j = 0; j < this.props.numCells; ++j) {
                cells.push([i,j]); // populate cell with lists of coordinates
            }
        }

        // create mapped
        let mapped = cells.map(function(tup, key){
            return <Cell key={key} boardWidth={self.props.numCells} x={tup[0]} y={tup[1]} gs_id={self.state.gs_id} gameOn={self.gameOn} winGame={self.winGame} bigOpened={self.bigOpened} toggleBigOpen={self.toggleBigOpen} endGame={self.endGame} updateFlags={self.updateFlags} openCell={self.openCell} ref={(cell) => {self.cellRefs[(tup[0]+","+tup[1])] = cell}} />
        });

        return mapped;
    }

    // this function launches a new game
    launchGame() {
        axios.post("http://127.0.0.1:8000/api/", {"msg":"new", "diff":"Beginner"})
        .then(function(res) {
            // if api responds with game session id, a new game was created
            if(res.data["gs_id"]) {
                gameOn = true;
                self.setState({
                    gs_id: res.data["gs_id"]
                });

                // redirect to game with id == gs_id
                self.props.history.push("/game/" + res.data["gs_id"]);
                self.toggleBigOpen(false);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    }

    // this function loads a game represented by gs_id if it exists
    loadGame() {
        // get gs_id from url
        console.log("loadGame");
        var gs_id = this.props.location.pathname;
        gs_id = gs_id.substring(6,9);

        this.setState({
            gs_id: gs_id
        });

        // flag all flagged cells and open all opened cells
        for(let i = 0;  i < self.props.numCells; ++i) {
            for(let j = 0; j < self.props.numCells; ++j) {

                axios.post("http://127.0.0.1:8000/api/"+gs_id+"/", {"msg":"isOpen?", "x":i, "y":j}).then(function(res) {

                    if(res.data["msg"] == true) {
                        self.ctrl && self.cellRefs[(i+","+j)].open(res.data["msg2"]["label"]);
                    }
                    else {
                        if(res.data["isFlagged"] == true) {
                            self.ctrl && self.cellRefs[(i+","+j)].setState({
                                flagged: true
                            });
                        }
                    }
                }).catch(function(err) {
                    console.log(err);
                });
            }
        }

        // run game only if it isn't over
        axios.post("http://127.0.0.1:8000/api/"+gs_id+"/", {"msg":"isOver?"}).then(function(res) {
            if(res.data["msg"] == true) {
                if(self.ctrl) self.ctrl.stopTimer();
                alert("Sorry this game is already over!!!");
            }
            else {
                gameOn = true;
                self.toggleBigOpen(res.data["bigOpen"]);
            }
        }).catch(function(err) {
            console.log(err);
        });

    }

    componentWillMount() {
        if(this.props.location.pathname == "/newGame") {
            this.launchGame();
        }

        else {
            this.loadGame();
        }
    }

    gameOn() {
        return gameOn;
    }

    openCell = (i, j) => {
        self.cellRefs[(i+","+j)].clicked();
    };

    // this function updates the flagsLeft display component
    updateFlags(flagsLeft) {
        self.ctrl && self.ctrl.updateFlags(flagsLeft);
    }

    // this function stops the game and alerts a victory message
    winGame() {
        self.gameOn = false;

        self.ctrl && self.ctrl.stopTimer();
        setTimeout(function() {alert("CONGRATULATIONS YOU WIN!!")}, 500);
    }

    // this function ends the game with a gameover alert message
    endGame(label, allBombs) {
        gameOn = false;

        // reveal all bombs
        for(let i = 0;  i < self.numCells; ++i) {
            for(let j = 0; j < self.numCells; ++j) {
                if(self.listHasCell(allBombs, [i, j])) {
                    self.ctrl && self.cellRefs[(i+","+j)].open(label);
                }
            }
        }

        // alert game over
        self.ctrl && self.ctrl.stopTimer();
        setTimeout(function() {alert("GAME OVER!!")}, 500);
    }

    // this function checks if cell is contained in l
    listHasCell(l, cell) {
        let hasCell = false;
        for(let i = 0; i < l.length; ++i) {
            if(l[i][0] == cell[0] && l[i][1] == cell[1]) {
                hasCell = true;
            }
        }
        return hasCell;
    }

    render() {
        return(
            <div onContextMenu={function(e){e.preventDefault();}}>
                <Route path="/game/:gs_id" render={()=>(
                    <div id="gameBoard" className="container">
                        <ControlPanel gs_id={this.state.gs_id} ref={(actrl) => {self.ctrl = actrl}} {...self.props} />
                        <div id="game" className="container">
                            <ul className="grid">
                                {this.getCells()}
                            </ul>
                        </div>
                    </div>
                )} />

            </div>
        );
    };
}

export default GameBoard;


    //
    // {this.state.gs_id && (
    //     <div id="gameBoard" className="container">
    //         <ControlPanel gs_id={this.state.gs_id} ref={"ctrl"} />
    //         <div id="game" className="container">
    //             <ul className="grid">
    //                 {this.getCells()}
    //             </ul>
    //         </div>
    //     </div>
    // )}
