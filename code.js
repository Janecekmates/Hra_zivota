var rows = 24;
var cols = 24;

var playing = false;

var grid = new Array(rows);
var nextGrid = new Array(rows);

var timer;
var reproductionTime = 200;

// Detekce mobilního zařízení
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function initializeGrids() {
  for (var i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
    nextGrid[i] = new Array(cols);
  }
}

function resetGrids() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j] = 0;
      nextGrid[i][j] = 0;
    }
  }
}

function cellClickHandler() {
  var rowcol = this.id.split('_');
  var row = rowcol[0];
  var col = rowcol[1];
  var classes = this.getAttribute('class');
  if (classes.indexOf('live') > -1) {
    this.setAttribute('class', 'dead');
    grid[row][col] = 0;
  } else {
    this.setAttribute('class', 'live');
    grid[row][col] = 1;
  }
}

// lay out the board
function createTable() {
  var gridContainer = document.getElementById('gridContainer');
  gridContainer.innerHTML = ''; // Clear previous table

  var table = document.createElement('table');
  table.setAttribute('id', 'gameTable');

  for (var i = 0; i < rows; i++) {
    var tr = document.createElement('tr');
    for (var j = 0; j < cols; j++) {
      var cell = document.createElement('td');
      cell.setAttribute('id', i + '_' + j);
      cell.setAttribute('class', 'dead');
      cell.onclick = cellClickHandler;
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }
  gridContainer.appendChild(table);
}

function setupControlButtons() {
  var startButton = document.getElementById('start');
  startButton.onclick = startButtonHandler;

  var clearButton = document.getElementById('clear');
  clearButton.onclick = clearButtonHandler;

  var randomButton = document.getElementById('random');
  randomButton.onclick = randomButtonHandler;

  var sizeSelector = document.getElementById('cellSize');
  sizeSelector.onchange = sizeSelectorHandler;
}

function sizeSelectorHandler() {
  var size = document.getElementById('cellSize').value;
  switch (size) {
    case 'small':
      rows = cols = 32;
      break;
    case 'medium':
      rows = cols = 24;
      break;
    case 'large':
      rows = cols = 16;
      break;
  }
  initializeGrids();
  createTable();
  resetGrids();
  console.log(`Grid resized to ${rows}x${cols}`);
}

function randomButtonHandler() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j] = Math.floor(Math.random() * 2);
      var cell = document.getElementById(i + '_' + j);
      if (grid[i][j] == 1) cell.setAttribute('class', 'live');
    }
  }
}

function clearButtonHandler() {
  playing = false;
  var startButton = document.getElementById('start');
  startButton.innerHTML = 'start';
  clearTimeout(timer);
  var cellList = document.getElementsByClassName('live');
  for (var i = 0; i < cellList.length; i++) {
    cellList[i].setAttribute('class', 'dead');
  }
  resetGrids();
}

function startButtonHandler() {
  if (playing) {
    playing = false;
    this.innerHTML = 'continue';
    clearTimeout(timer);
  } else {
    playing = true;
    this.innerHTML = 'pause';
    play();
  }
}

function play() {
  computeNextGen();

  if (playing) {
    timer = setTimeout(play, reproductionTime);
  }
}

function computeNextGen() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      applyRules(i, j);
    }
  }
  copyAndResetGrid();
  updateView();
}

function applyRules(row, col) {
  var numNeighbors = countNeighbors(row, col);
  if (grid[row][col] == 1) {
    if (numNeighbors < 2) {
      nextGrid[row][col] = 0;
    } else if (numNeighbors == 2 || numNeighbors == 3) {
      nextGrid[row][col] = 1;
    } else if (numNeighbors > 3) {
      nextGrid[row][col] = 0;
    }
  } else if (grid[row][col] == 0) {
    if (numNeighbors == 3) {
      nextGrid[row][col] = 1;
    }
  }
}

function countNeighbors(row, col) {
  var count = 0;
  if (row - 1 >= 0) {
    if (grid[row - 1][col] == 1) count++;
  }
  if (row - 1 >= 0 && col - 1 >= 0) {
    if (grid[row - 1][col - 1] == 1) count++;
  }
  if (row - 1 >= 0 && col + 1 < cols) {
    if (grid[row - 1][col + 1] == 1) count++;
  }
  if (col - 1 >= 0) {
    if (grid[row][col - 1] == 1) count++;
  }
  if (col + 1 < cols) {
    if (grid[row][col + 1] == 1) count++;
  }
  if (row + 1 < rows) {
    if (grid[row + 1][col] == 1) count++;
  }
  if (row + 1 < rows && col - 1 >= 0) {
    if (grid[row + 1][col - 1] == 1) count++;
  }
  if (row + 1 < rows && col + 1 < cols) {
    if (grid[row + 1][col + 1] == 1) count++;
  }
  return count;
}

function copyAndResetGrid() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j] = nextGrid[i][j];
      nextGrid[i][j] = 0;
    }
  }
}

function updateView() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var cell = document.getElementById(i + '_' + j);
      if (grid[i][j] == 0) {
        cell.setAttribute('class', 'dead');
      } else {
        cell.setAttribute('class', 'live');
      }
    }
  }
}

// initialize
function initialize() {
  if (isMobile()) {
    rows = cols = 8; // Smaller grid for mobile
  }
  createTable();
  initializeGrids();
  resetGrids();
  setupControlButtons();
}

// start everything
window.onload = initialize();
