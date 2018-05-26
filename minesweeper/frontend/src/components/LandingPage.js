import React, { Component } from "react"

 class LandingPage extends Component {
    constructor(props) {
        super(props);

        this.style = {
            position: 'absolute',
            top: '30%',
            width: '30%',
            height: '40%',
            left: '35%',
            textAlign: 'center',
            display: 'grid',
            gridTemplateColumn: '2fr, 1fr, 1fr, 1fr',
            backgroundColor: '#fff',
            opacity: '.7',
            boxShadow: '0 5px 5px 5px'
        };

        this.headerStyle = {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#004259',
            background: 'linear-gradient(to right, #D7A5FF, #DA96E8, #FFB2F0, #E896B0, #FFAAA5)'
        };

        this.btnStyle = {
            borderRadius: '0',
            backgroundColor:'#004259',
            color: '#fff'
        };

        this.state = {
            inputVal: "",
            load: false
        };
    }

    newGame = () => {this.props.history.push("/newGame")};

    loadGame = () => {this.props.history.push("/game/"+this.state.inputVal)};

    validateInput = (e) => {
        if(!isNaN(e.target.value)) {
            this.setState({
                inputVal: e.target.value,
            });
        }
    };

    render() {
        // document.body.style.backgroundColor = "#001200";
        return(
            <div style={this.style}>
                <div style={this.headerStyle}>
                    <h1>MineSweeper</h1>
                </div>

                <button className='btn' style={this.btnStyle} onClick={this.newGame}>New Game</button>

                {this.state.load && (<input value={this.state.inputVal} style={{textAlign: 'center'}} onChange={this.validateInput} />)}

                {this.state.load && (<button className="btn btn-primary" style={{borderRadius: '0'}} onClick={this.loadGame}>Submit</button>)}

                {!this.state.load && (<button className='btn' onClick={() => {this.setState({load: true})}}>Load Game</button>)}
            </div>
        );
    }
}

export default LandingPage;

/*
<button className='btn'>New Game</button>
<button className='btn'>Load Game</button>
*/
