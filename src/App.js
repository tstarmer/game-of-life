import React, { Component } from 'react';

import './App.css';

/*TO DO*/
/*
1) Disable boards size and next buttons while playing, or paused
2) Add population distribution variables
3) Add a instruction section




*/



class App extends Component {
  constructor(){
    super();
    this.state = {
      cellSize: 16, //was 12
      boardRows : 30, //was 30
      boardColumns : 50, //was 50
      playSpeed: "Normal",
      playSpeeds: {
        "Slow" : 1000,
        "Normal": 500,
        "Fast": 250
      }, 
      playstate: "Pause"
    }
  }

  gameControl = (e)=>{
    // console.log(e.target.value)
    this.setState({playstate: e.target.value})

  }

  changeGameSpeed = (e) =>{
    // console.log(e.target.value)
    this.setState({playSpeed: e.target.value})
  }

  changeBoardDimensions = (e) =>{
    // console.log(e.target.attributes["data-columns"].value)
    // console.log(e.target.data-row)
    var rows = parseInt(e.target.attributes["data-row"].value, 10)
    // console.log(rows)
    this.setState({
      boardRows: rows,
      boardColumns:parseInt(e.target.attributes["data-columns"].value, 10)
    })
    // console.log(this.state.boardRows, this.state.boardColumns)
    // console.log("Board dims", this.state)
  }

  render() {
    return (
      <div className="App">
        <PlayControls playstate={this.state.playstate} buttonClick={this.gameControl} />
        <Board
          cellSize={this.state.cellSize} 
          rows={this.state.boardRows}
          columns={this.state.boardColumns}
          playSpeed={this.state.playSpeeds[this.state.playSpeed]}
          playstate={this.state.playstate}
          />
        <BoardControls speedButtonClick={this.changeGameSpeed} boardDimButtonClick={this.changeBoardDimensions}/>

      </div>
    );
  }
}

class PlayControls extends Component{
  render(){
    return(
        <div className="controls">
          <button 
            className="btn play-btn" 
            onClick={this.props.buttonClick} 
            value="Play">
            Play
            </button>
          <button
            className="btn pause-btn" 
            onClick={this.props.buttonClick} 
            value="Pause">
              Pause
            </button>
          <button
            className="btn stop-btn" 
            onClick={this.props.buttonClick} 
            value="Stop">
              Stop
            </button>
          <button
            className="btn next-btn" 
            onClick={this.props.buttonClick} 
            value="Next">
              Next
            </button>
        </div>
      )
  }
}

class BoardControls extends Component{
  render(){
    return(
        <div className="controls clear">
          <div className="row">
            <span>Board Size:</span>
            <button onClick={this.props.boardDimButtonClick} data-row="30" data-columns="50"> 50 x 30</button>
            <button onClick={this.props.boardDimButtonClick} data-row="50" data-columns="70"> 70 x 50</button>
            <button onClick={this.props.boardDimButtonClick} data-row="70" data-columns="100"> 100 x 70</button>
          </div>
          <div className="row">
            <span>Game Speed:</span>
            <button onClick={this.props.speedButtonClick} value="Slow">Slow</button>
            <button onClick={this.props.speedButtonClick} value="Normal">Normal</button>
            <button onClick={this.props.speedButtonClick} value="Fast">Fast</button>

          </div>
        </div>
      )
  }
}

class Board extends Component{
  constructor(){
    super();
    this.state={
      cells : [],
      generations: 0
    }
  }
  // getInitialState : function(){

  // }
//initialize board functions
  randomStage = (min,max)=>{
    var result = Math.floor(Math.random()*(max-min+1)+min); 
    //add a population density variable
    if(result === max){
      return "alive"
    }
    return "dead"    
  }

  populateCells = (rows, columns)=>{
    //random alive or dead for each cell
    var cells = []
    for(var row=0; row<rows; row++){
      cells[row] = []
      for(var col=0; col<columns; col++){
        cells[row][col] = this.randomStage(1,2)
      }
    }
    // return cells
    
    this.setState({cells:cells})
  }

  componentWillMount (){
    // console.log("will mount")
    this.populateCells(this.props.rows, this.props.columns)
  }

// end initialize functions

//begin run functions

   modulo =(number, mod)=>{
      // return((number%mod)+mod)%mod
      return(number+mod)%mod
   } 


  checkNeighbors = (row, column, cellStage) =>{
    var cells = this.state.cells
    // var targetCell = this.state.cells[row][column] 
        
    var rowMin = this.modulo((row - 1),this.props.rows)
    var rowMax = this.modulo((row + 1),this.props.rows)
    var colMin = this.modulo((column - 1),this.props.columns)
    var colMax = this.modulo((column +1),this.props.columns)

    var rows = [rowMin, row, rowMax]
    var columns = [colMin, column, colMax]
    //iterative-cells[rowMin][colMin],cells[rowMin][column],cells[rowMin][colMax],cells[row][colMin],cells[row][colMax],cells[rowMax][colMax],cells[rowMax][col], cells[rowMax][colMax]

    var aliveNeighbors = 0;

    

    // console.log("begin checkneighbors  for ", row, " ,", column, " stage is", cellStage)
    
    for(var i= 0; i < 3; i++){
      
      for(var j = 0; j < 3 ; j++){
        // console.log("checking", rows[i], columns[j], "value is ", cells[rows[i]][columns[j]] )
        if(i===1 && j === 1){
          //do nothing
          aliveNeighbors += 0;
          // console.log("center skip")
        }else if(cells[rows[i]][columns[j]]!=="dead"){
          // console.log(cells[rows[i]][columns[j]], "is alive so add")
          
          aliveNeighbors++;
        }
      }

    }
    
    // console.log("End checkneighbors")
    // console.log("neighbors:", aliveNeighbors, "stage is", cellStage)
  
    /*  
    Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
    Any live cell with two or three live neighbours lives on to the next generation.
    Any live cell with more than three live neighbours dies, as if by overpopulation.
    Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    */

    if(cellStage !=="dead" && (aliveNeighbors > 4 || aliveNeighbors <2)){
      return "dead"
    }else if(cellStage === "dead" && aliveNeighbors === 3){
      //set state to alive
      // console.log("dead to alive")
      return "alive"
    }else if(cellStage !== "dead" && (aliveNeighbors === 2 || aliveNeighbors === 3)){
      //set state to alive
      //console.log("cell is", cellStage, "it is now", this.lifeCycle(targetCell,"alive"))
      // console.log("alive to old")
      // return "old"
      return "old"
    }else{
      //set state to dead
      // console.log("its dead")
      return "dead"
    }

  }
  
  copy2DArray = (array) => {
    var copiedArray = []
    for(var row = 0; row<this.props.rows; row++){
      copiedArray.push(array[row].slice(0))
    }

    return copiedArray;

  }

  updateBoard = () =>{
    
    var cells = this.copy2DArray(this.state.cells)
    for(var row = 0; row < this.props.rows; row++){
      // console.log("row", cells[row])
      for(var col = 0; col < this.props.columns; col++){
        var stage = cells[row][col]
        // console.log("column", col)
        cells[row][col] = this.checkNeighbors(row, col, stage)
        }
      }
      // console.log("board update complete")
      

    this.setState({cells:cells,
      generations:this.state.generations + 1})
  }
  
  componentWillReceiveProps(nextProps){
    // console.log("receiving props")
    if((this.props.rows !== nextProps.rows) || (this.props.columns !== nextProps.columns)){
      this.populateCells(nextProps.rows, nextProps.columns);
    }

    if(this.props.playstate !== nextProps.playstate || nextProps.playstate === "Next"){
      // let interval
      switch(nextProps.playstate){
      case "Play":
        // console.log("setting interval")
        this.interval = setInterval(this.updateBoard,this.props.playSpeed)

        break;
      case "Pause":
        // console.log("Pause: clearing interval")
        clearInterval(this.interval)
        break;
      case "Stop":
        // console.log("Stop: clearing interval")
        clearInterval(this.interval)
       
        break;
      case "Next":
           this.updateBoard()
          break;
      default:
        break;
      }
    }
  }

  // componentDidMount (){
    
  //     // console.log("mounted")

  // }
   
  render(){

    const boardStyle = {
      display: "block",
      width: this.props.columns*this.props.cellSize + "px",
      height: this.props.rows*this.props.cellSize + "px"
    }
    
    var cells = []
    // console.log("board render", this.props)
    for(var row=0; row<this.props.rows; row++){
      cells[row] = []
      // console.log("cells before", cells)

      for(var col=0; col<this.props.columns; col++){
            // console.log(this.state.cells[row][col])
            cells[row][col] = <Cell 
              {...this.props} 
              key={row*this.props.columns + col} 
              id={row*this.props.columns + col} 
              row={row} 
              col={col}
              value={this.state.cells[row][col]}
            />
      }
    }
    // console.log(cells)

    return(
        <div style={boardStyle} className="board">
         <GenerationCounter generations={this.state.generations}/>
         {cells}
         
        </div>
      )
  }
}

class Cell extends Component{
  
  render(){
    var cellColor = this.props.value === "alive" ? "lightblue" : "white"
    if(this.props.value === "old"){
      cellColor = "darkblue"
    }

    const cellStyle = {
      width: this.props.cellSize +"px",
      height: this.props.cellSize + "px",
      backgroundColor: cellColor,
    }
    return(
        <div style={cellStyle} className="cell" onClick={this.props.click} value={this.props.value}>
          
        </div>
      )
  }
}

class GenerationCounter extends Component{
  render(){
    return (
      <h6>Generations: {this.props.generations}</h6>
    )
  }
}
export default App;
