import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const numberOfRow = 3;
const numberOfCol = 3;

function Square(props) {
	return (
		<button className="square" style={{ fontWeight: props.fontWeight }} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return [a, b, c];
		}
	}
	return [null, null, null];
}


function calculateLocation(stepLocation) {
	const col = stepLocation % numberOfCol + 1;
	const row = Math.floor(stepLocation / numberOfCol) + 1;
	return [col, row];
}

class Board extends React.Component {
	renderSquare(i) {
		let fontWeight = null;
		if (this.props.winLine[0] != null && (this.props.winLine).includes(i)) {
			fontWeight = 'bold'
		}
		return (<Square key={i} value={this.props.squares[i]} fontWeight={fontWeight} onClick={() => this.props.onClick(i)} />);
	}

	render() {
		let board = [];
		let sum = 0;
		for (let i = 0; i < numberOfRow; i++) {
			let row = [];
			for (let j = 0; j < numberOfCol; j++) {
				row.push(this.renderSquare(sum));
				sum += 1;
			}
			board.push(<div key={i} className='board-row'>{row}</div>);
		}
		return <div key="board">{board}</div>;
	}
}

const initialState = {
	history: [{
		squares: Array(9).fill(null),
		step: 0,
		col: 0,
		row: 0
	}],
	xIsNext: true,
	stepNumber: 0,
	winLine: Array(3).fill(null),
};

class Game extends React.Component {
	toggle = false;
	constructor(props) {
		super(props);
		this.state = initialState;
	}

	resetState() {
		this.setState(initialState)
	}

	handleClick(i) {
		if (this.state.winLine[0] != null) {
			this.render();
			return;
		}

		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		if (squares[i] !== null)
			return;

		squares[i] = this.state.xIsNext ? 'X' : 'O';
		const [col, row] = calculateLocation(i);
		
		this.setState({
			history: history.concat([{
				squares: squares,
				step: history.length,
				col: col,
				row: row,
			}]),
			winLine: (calculateWinner(squares)).slice(),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
		});
	}

	sort() {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		if (!this.toggle) {
			history.sort((a, b) => b.step - a.step)
			this.toggle = true;
		}
		else {
			history.sort((a, b) => a.step - b.step)
			this.toggle = false;
		}
		this.setState({ history: history })
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const moves = history.map((step, move) => {
			const desc = move ?
				'Go to move #' + step.step + ' (col:' + step.col + ',row:' + step.row + ')' :
				'Go to game start';
			let fontWeight = 'normal'
			if (this.state.stepNumber === move)
				fontWeight = 'bold'
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)} style={{ fontWeight: fontWeight }}>{desc}</button>
				</li>
			);
		});

		let status;
		if (this.state.winLine[0] !== null) {
			status = 'Winner: ' + (this.state.xIsNext ? 'O' : 'X');
		} else if ((this.state.stepNumber === (numberOfCol * numberOfRow)) && (this.state.winLine[0] === null)) {
			status = 'Draw';
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
						winLine={this.state.winLine}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<div>
						<button onClick={() => this.resetState()}>Clear</button>
						<button onClick={() => this.sort()}>Sort</button>
					</div>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
