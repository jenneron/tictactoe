import './style.css';
import './generateField';

const undoButton = document.querySelector('.undo-btn');
const redoButton = document.querySelector('.redo-btn');
const restartButton = document.querySelector('.restart-btn');
const allCells = document.querySelectorAll('.cell');

function getUndoes() {
  return JSON.parse(localStorage.getItem('undoes'));
}

function setUndoes(array) {
  return localStorage.setItem('undoes', JSON.stringify(array));
}

function getCellState() {
  return JSON.parse(localStorage.getItem('cellState'));
}

function setCellState(moves) {
  return localStorage.setItem('cellState', JSON.stringify(moves));
}

function getCell(dataId) {
  return document.querySelector(`.cell[data-id="${dataId}"]`);
}

function getCurrentPlayer(moves) {
  return moves[moves.length - 1].player === 'ch' ? 'r' : 'ch';
}

function compareResultLines(checkMoves, playerMoves) {
  let statement = true;
  const resultMoves = [];
  checkMoves.forEach(el => {
    statement = statement && playerMoves.includes(el);
    resultMoves.push(el);
  });
  if (statement) {
    return resultMoves;
  }
  return false;
}

function addWinClasses(moves, elementClass) {
  moves.forEach(el => {
    const cell = getCell(el);
    cell.classList.add(elementClass);
    cell.classList.add('win');
    undoButton.disabled = true;
  });
}

function finishByDraw() {
  const wonTitle = document.querySelector('.won-title');
  const wonMessage = document.querySelector('.won-message');
  wonTitle.classList.remove('hidden');
  wonMessage.innerHTML = "It's a draw!";
  undoButton.disabled = true;
}

function checkWin(moves) {
  const sideСount = document.querySelectorAll('.row').length;
  let rows = [...document.querySelectorAll('.row')];
  rows = rows.map(el => [...el.querySelectorAll('.cell')].map(elem => elem.getAttribute('data-id')));
  const columns = [];
  for (let i = 1; i <= sideСount; i += 1) {
    columns.push([...document.querySelectorAll(`.row .cell:nth-child(${i})`)].map(el => el.getAttribute('data-id')));
  }
  const diagonals = [[], []];
  for (let i = 0, j = sideСount - 1; i < sideСount; i += 1, j -= 1) {
    diagonals[0].push(rows[i][i]);
    diagonals[1].push(columns[i][j]);
  }
  let flag = false;
  [columns, rows, diagonals].forEach(el => {
    el.forEach(elem => {
      const statement = compareResultLines(elem, moves);
      if (statement) {
        const wonTitle = document.querySelector('.won-title');
        const wonMessage = document.querySelector('.won-message');
        const cell = getCell(elem[0]);
        wonTitle.classList.remove('hidden');
        if ([...cell.classList].includes('ch')) wonMessage.innerHTML = 'Crosses won!';
        else wonMessage.innerHTML = 'Toes won!';
        diagonals.forEach(diagonal => {
          const compare = compareResultLines(diagonal, moves);
          if (compare) {
            if (diagonals[0].includes(compare[0])) {
              addWinClasses(compare, 'diagonal-right');
              flag = true;
            } else if (diagonals[1].includes(compare[0]) && !flag) {
              addWinClasses(compare, 'diagonal-left');
              flag = true;
            }
          }
        });
        rows.forEach(row => {
          const compare = compareResultLines(row, moves);
          if (compare && !flag) {
            addWinClasses(compare, 'horizontal');
            flag = true;
          }
        });
        columns.forEach(column => {
          const compare = compareResultLines(column, moves);
          if (compare && !flag) {
            addWinClasses(compare, 'vertical');
            flag = true;
          }
        });
      }
    });
  });
  return flag;
}

function clear() {
  allCells.forEach(cell => {
    const wonMessage = document.querySelector('.won-message');
    wonMessage.innerHTML = '';
    const wonTitle = document.querySelector('.won-title');
    wonTitle.classList.add('hidden');
    if ([...cell.classList].includes('ch')) cell.classList.remove('ch');
    if ([...cell.classList].includes('r')) cell.classList.remove('r');
    if ([...cell.classList].includes('win')) cell.classList.remove('win');
    if ([...cell.classList].includes('horizontal')) cell.classList.remove('horizontal');
    if ([...cell.classList].includes('vertical')) cell.classList.remove('vertical');
    if ([...cell.classList].includes('diagonal-right')) cell.classList.remove('diagonal-right');
    if ([...cell.classList].includes('diagonal-left')) cell.classList.remove('diagonal-left');
  });
  undoButton.disabled = true;

  setCellState([]);
  setUndoes([]);
}

function init() {
  let undoes = getUndoes();
  let cellState = getCellState();

  if (undoes === null) setUndoes([]);
  if (cellState === null) setCellState([]);
  if (cellState === null || undoes === null) {
    undoes = getUndoes();
    cellState = getCellState();
  }
  if (cellState.length === 0) undoButton.disabled = true;
  else undoButton.disabled = false;
  if (undoes.length === 0) redoButton.disabled = true;
  else redoButton.disabled = false;

  if (cellState.length !== 0) {
    [...cellState].forEach(el => {
      const currentCell = getCell(el.dataId);
      currentCell.classList.add(el.player);
    });
  }

  if (undoes.length !== 0) {
    [...undoes].forEach(el => {
      const currentCell = getCell(el.dataId);
      currentCell.classList.remove(el.player);
    });
  }

  const crossesMoves = cellState.filter(el => el.player === 'ch').map(el => el.dataId);
  const toesMoves = cellState.filter(el => el.player === 'r').map(el => el.dataId);
  const crossesWin = checkWin(crossesMoves);
  const toesWin = checkWin(toesMoves);
  if (!crossesWin && !toesWin) {
    let statement = true;
    allCells.forEach(cell => {
      statement = statement && ([...cell.classList].includes('ch') || [...cell.classList].includes('r'));
    });
    if (statement) {
      finishByDraw();
    }
  }
}

window.addEventListener('storage', event => {
  const undoes = getUndoes();
  if (event.key === 'cellState' && event.newValue === '[]' && undoes.length === 0) clear();
  init();
});

init();

document.addEventListener('click', event => {
  if (event.target === undoButton) {
    const cellsState = getCellState();
    const lastState = cellsState[cellsState.length - 1];
    let undoes = getUndoes();
    const currentUndo = {
      dataId: lastState.dataId,
    };
    if (undoes.length === 0) {
      currentUndo.player = lastState.player;
      undoes = [currentUndo];
    } else {
      currentUndo.player = getCurrentPlayer(undoes);
      undoes.push(currentUndo);
    }
    cellsState.pop();
    setUndoes(undoes);
    setCellState(cellsState);
  } else if (event.target === redoButton) {
    const cellsState = getCellState();
    const undoes = getUndoes();
    cellsState.push(undoes[undoes.length - 1]);
    undoes.pop();
    setCellState(cellsState);
    setUndoes(undoes);
  } else if (event.target === restartButton) {
    clear();
  } else if ([...allCells].includes(event.target)) {
    const wonMessage = document.querySelector('.won-message');
    if (wonMessage.innerHTML !== '') return;
    const dataId = event.target.getAttribute('data-id');
    let cellsState = getCellState();
    const currentState = {
      dataId,
    };
    if (cellsState.length === 0) {
      currentState.player = 'ch';
      cellsState = [currentState];
    } else {
      if (cellsState.map(x => x.dataId).includes(currentState.dataId)) return;
      currentState.player = getCurrentPlayer(cellsState);
      cellsState.push(currentState);
    }
    setCellState(cellsState);
    setUndoes([]);
  }
  init();
});
