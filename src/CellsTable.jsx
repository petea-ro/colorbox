import React, { Component } from 'react';

export default class CellsTable extends Component {
	handleCellClick(row, col){
		this.props.onCellClick(row, col);
	}
	render() {
		var cells = [];
		var color = '';
		var cell = '';


		this.props.matrix.forEach( (row, rowIndex) => {
			cells.push(<div key={"row_"+rowIndex} className="clearfix"></div>)
			row.forEach( (colorIndex, cellIndex) => {
				var isActive = this.props.siblings.indexOf(rowIndex+','+cellIndex)>=0;

				color = this.props.colors[colorIndex];
				cell = <Cell 
							key={rowIndex+'_'+cellIndex} 
							color={color} 
							row={rowIndex} 
							col={cellIndex}
							isActive={isActive}
							onClick={this.handleCellClick.bind(this)}
							onHover={this.props.onCellHover.bind(this)}
						/>				
				cells.push(cell)
			})			
		})
		return (
			<div className="CellsTable">
				{cells}
			</div>
		);
	}
}


class Cell extends Component {
	handleClick(){
		this.props.onClick(this.props.row, this.props.col);
	}
	handleHover(){
		this.props.onHover(this.props.row, this.props.col);
	}
	render() {
		var className = "cell "+ this.props.color;
		className += this.props.isActive ? ' active' : ''
		return (
			<div 
				className={className} 
				onClick={this.handleClick.bind(this)}
				onMouseEnter={this.handleHover.bind(this)}
			>
			</div>
		);
	}
}

