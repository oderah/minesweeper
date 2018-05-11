import React from "react";

import ReactDOM from "react-dom";

import { BrowserRouter, Route, browserHistory, IndexRoute } from "react-router-dom";

import GameBoard from "./GameBoard";

import "../../static/css/App.css";

const App = () => (
    <BrowserRouter history={browserHistory}>
        <Route path="/" component={(props) => (<GameBoard numCells={15} {...props} />)} />
    </BrowserRouter>
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;
