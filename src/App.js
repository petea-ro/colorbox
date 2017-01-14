import React, { Component } from 'react';
import './App.css';
import CellsTable from './CellsTable';

const conf = {
  cols: 10,
  rows: 10,
  cellSize: '50px',
  colors: ['white','red','blue','green','yellow']
}

class App extends Component {
  constructor(props){
    super(props);
    this.checkCollapseColumn = this.checkCollapseColumn.bind(this);
    this.calculateMoves = this.calculateMoves.bind(this);
    this.state=({
      matrix:[],
      countClicks:0,
      siblings: [],
      points: 0,
      moves: 0
    });    
  }
  componentDidMount(){    
    this.generateMatrix();
    this.setStyles();
    window.addEventListener("resize", this.setStyles.bind(this));
  }
  generateMatrix(){
    var countColors = conf.colors.length;
    var matrix = []
    var i,j = 0;
    for(i = 0; i< conf.rows; i++){
      matrix[i] = [];
      for(j = 0; j<conf.cols; j++){
        var   colorIndex = Math.floor(Math.random() * (countColors-1)) + 1;
        matrix[i][j] = colorIndex;
      }
    }
    this.setState({
      matrix:matrix,
      countClicks:0,
      points: 0,
      moves: '0'
    })
    return matrix;
  }
  handleCellClick(row, col){    
    var matrix = this.state.matrix;
    
    //exit if white cell is clicked
    if(matrix[row][col]===0){ 
      return;
    }

    var siblings = this.findCellSiblings(row, col);
    var countSiblings = Object.keys(siblings).length;

    if(countSiblings===1){
      return;
    }

    //sort siblings in such way so upper cells are positioned last
    siblings.sort(); //sort is required to collapse without bugs

    //collapse siblings
    siblings.forEach( (key) => {
      var coords = key.split(',');
      var x = parseInt(coords[0], 10);
      var y = parseInt(coords[1], 10);
      matrix[x][y] = 0; //collapse siblings by setting white color

      //falldown upper cells
      for(var i = x; i>0; i--){
        var j = i-1;
        var m = matrix[i][y];
        matrix[i][y] = matrix[j][y];
        matrix[j][y] = m;
      }
    });

    var points = this.calculatePoints(countSiblings);
   
    this.setState({
      countClicks: this.state.countClicks+1, 
      siblings: [],
      points: this.state.points + points,
    });
    this.checkCollapseColumn();
    this.handleCellHover(row, col);
    this.calculateMoves();
  }
  calculatePoints(countCells){
    return Math.pow(2, countCells);
  }
  handleCellHover(row, col){
    var matrix = this.state.matrix;
    //exit if white cell is clicked
    if(matrix[row][col]===0){ 
      return;
    }

    var siblings = this.findCellSiblings(row, col);
    var countSiblings = Object.keys(siblings).length;

    this.setState({
      siblings: countSiblings>1 ? siblings : []
    }); 
  }

  findCellSiblings(row, col, siblings){
    var key = '';
    if(!siblings){
      //find all sibligns with same color    
      key = row+","+col;
      siblings = [key];
    }
    var matrix = this.state.matrix;
    var colorIndex = matrix[row][col];
   
    //check siblings
    var  pairs = [[row-1, col],[row+1, col],[row, col-1],[row,col+1]];

    //loop each pair and check color
    pairs.forEach( (pair) => {
      var i = pair[0];
      var j = pair[1];
      if(i<0 || j<0 || i>=conf.rows || j>=conf.cols){
        return; //out of box address
      }
      var key = i+','+j;
      //check if same color and not in siblings array
      if(colorIndex === matrix[i][j] && siblings.indexOf(key) ===-1){
        siblings.push(key);
        //find all siblings of sibling cell
        siblings = this.findCellSiblings(i,j, siblings);
      }
    });

    return siblings;
  }
  checkCollapseColumn(){
   //check every column if is empty and collapse it 
    var matrix = this.state.matrix;

    var x = conf.rows-1; //last row (bottom side)
    for(var y=conf.cols-1; y>=0; y--){
      if(matrix[x][y] === 0){ //column y is empty
        //move all elements from right side to left for emty columns
        for(var i = 0; i<conf.rows; i++){
          for(var j = y; j<conf.cols; j++){
            matrix[i][j] = j+1 < conf.cols ? matrix[i][j+1] : 0;
          }
        }      
      }
    }
    this.setState({
      matrix: matrix
    })
  }
  calculateMoves(){
    var matrix = this.state.matrix;
    if(!matrix){
      return;
    }
    var moves = 0;
    var usedcells = [];
    for(var i = 0; i<conf.rows; i++){
      for(var j = 0; j<conf.cols; j++){
        var color = matrix[i][j];
        var key = i+","+j;
        if(color && usedcells.indexOf(key)===-1){
          var siblings = this.findCellSiblings(i,j);
          var countSiblings = Object.keys(siblings).length;

          if(countSiblings>1){
             moves++; 
          }
          //add cell and siblings to usercells array
          usedcells = usedcells.concat(siblings);      
        }
      }
    }
    this.setState({
      moves: moves
    });
    return moves;
  }
  setStyles(){
    var width = document.getElementById('root').offsetWidth;
    var cellWidth = Math.min(width/conf.cols, 60);
    var styles = ".cell{width:"+cellWidth+"px;height:"+cellWidth+"px;}";
    conf.colors.forEach( (color) => {
      styles += "."+color+"{background:"+color+";}";
    })
    this.setState(
      {styles: styles}
    );

  }
  render() {
    return (
      <div>
          <style>{this.state.styles}</style>
          <p>
            <button className="btn btn-primary" onClick={this.generateMatrix.bind(this)}>New Game</button>
            <span className="info">Clicks: {this.state.countClicks}</span>
            <span className="info">Moves: {this.state.moves}</span>
            <span className="info">Points: {this.state.points.toLocaleString()}</span>
          </p>
          {this.state.moves === 0 
              ? <div className="alert alert-danger alert-finish">Game Over! Click on New Game</div> 
              :''
          }
          <CellsTable 
            matrix={this.state.matrix} 
            siblings={this.state.siblings}
            colors={conf.colors} 
            onCellClick={this.handleCellClick.bind(this)}
            onCellHover={this.handleCellHover.bind(this)}
          />
      </div>
    );
  }
}

export default App;

