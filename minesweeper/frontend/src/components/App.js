import React from "react";
// import React, { Component } from "react";

import ReactDOM from "react-dom";

import { BrowserRouter, Switch, Route, browserHistory, IndexRoute } from "react-router-dom";

import GameBoard from "./GameBoard";

import LandingPage from "./LandingPage";

import "../../static/css/App.css";

document.body.style.backgroundColor = "#003230";

const App = () => (
    <BrowserRouter history={browserHistory}>
        <Switch>
            <Route exact path="/" component={(props) => (<LandingPage {...props} />)} />
            <Route path="/" component={(props) => (<GameBoard numCells={15} {...props} />)} />
        </Switch>
    </BrowserRouter>
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;

/*
<Route path="/" component={(props) => (<GameBoard numCells={15} {...props} />)} />
*/

//  class App extends Component {
//     constructor(props) {
//         super(props);
//
//         // const components = {
//         //     "LandingPage": <LandingPage />
//         // };
//
//         // state = {};
//     }
//
//     // toggle = (props) => {
//     //     if(this.location == "/") {
//     //         return(<LandingPage {...props} />);
//     //     }
//     // };
//
//     render() {
//         return(
//             <BrowserRouter history={browserHistory}>
//                 <Route path="/" component={<LandingPage {...props} />} />
//             </BrowserRouter>
//         );
//     }
// }
//
// export default App;
