import { AREAS } from "./areas.data.js";
import { CHARACTERS } from "./characters.data.js";
/* ========================================================================= */
/* =============================== EXECUTION =============================== */
/* ========================================================================= */

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

const renderScreenCell = (currentScreenLine, currentColumnNumber) => {
  return `
    <div id="${currentScreenLine}${currentColumnNumber}" class="screen-cell" onclick="onCellClick('${currentScreenLine}${currentColumnNumber}')")><span class="cell-name">${currentScreenLine}${currentColumnNumber}</span></div>
  `;
}

const renderScreenLineCells = (currentScreenLine) => {
  let  txt = '';
  for (let index = 1; index < 17; index++) {
    txt += `${renderScreenCell(currentScreenLine, index)}`;
  }
  return txt;
}

const renderScreenLine = (currentScreenLine) => {
  return `
    <div id="line${currentScreenLine}" class="screen-line">
      ${renderScreenLineCells(currentScreenLine)}
    </div>
  `;
}

const renderScreenLines = () => {
  let  txt = '';
  for (let index = 0; index < letters.length; index++) {
    txt += `${renderScreenLine(letters[index])}`;
  }
  return txt;
}

document.getElementById('main').innerHTML = `
<div id="topArea" class="top-area"></div>
  <div id="screenArea" class="screen-area">
    ${renderScreenLines()}
    <div id="player" class="player"></div>
  </div>
  <div id="buttonsArea" class="buttons-area">
    <div class="cross-container">
      <button class="cross-button left" onclick="movePlayer('left')"><img class="button-caret" src="./medias/images/icons/caret-left-solid.svg"/></button>
      <button class="cross-button up" onclick="movePlayer('up')"><img class="button-caret" src="./medias/images/icons/caret-up-solid.svg"/></button>
      <button class="cross-button right" onclick="movePlayer('right')"><img class="button-caret" src="./medias/images/icons/caret-right-solid.svg"/></button>
      <button class="cross-button down" onclick="movePlayer('down')"><img class="button-caret" src="./medias/images/icons/caret-down-solid.svg"/></button>
    </div>
  </div>
`;

let isSelected = false;

const onCellClick = (cellId) => {
  //console.log(cellId);
  if (!isSelected) {
    const CELL = document.getElementById(cellId);
    if (CELL.classList.contains('selectable')) {
      CELL.classList.replace('selectable', 'selected');
      isSelected = true;
      document.getElementById('buttonsArea').innerHTML = '';
      document.getElementById('buttonsArea').innerHTML = `<button class="abort-button" onclick="abortFishing('${cellId}')">ANNULER</button>`;
    }
  }
}
window.onCellClick = onCellClick;

const abortFishing = (cellId) => {
  //console.log(cellId);
  if (isSelected) {
    const CELL = document.getElementById(cellId);
    if (CELL.classList.contains('selected')) {
      CELL.classList.replace('selected', 'selectable');
      isSelected = false;
      document.getElementById('buttonsArea').innerHTML = '';
      document.getElementById('buttonsArea').innerHTML = `
      <div class="cross-container">
        <button class="cross-button left" onclick="movePlayer('left')"><img class="button-caret" src="./medias/images/icons/caret-left-solid.svg"/></button>
        <button class="cross-button up" onclick="movePlayer('up')"><img class="button-caret" src="./medias/images/icons/caret-up-solid.svg"/></button>
        <button class="cross-button right" onclick="movePlayer('right')"><img class="button-caret" src="./medias/images/icons/caret-right-solid.svg"/></button>
        <button class="cross-button down" onclick="movePlayer('down')"><img class="button-caret" src="./medias/images/icons/caret-down-solid.svg"/></button>
      </div>`;
    }
  }
}
window.abortFishing = abortFishing;

const continueFishing = () => {
  isSelected = false;
  document.getElementById('buttonsArea').innerHTML = '';
  document.getElementById('buttonsArea').innerHTML = `
  <div class="cross-container">
    <button class="cross-button left" onclick="movePlayer('left')"><img class="button-caret" src="./medias/images/icons/caret-left-solid.svg"/></button>
    <button class="cross-button up" onclick="movePlayer('up')"><img class="button-caret" src="./medias/images/icons/caret-up-solid.svg"/></button>
    <button class="cross-button right" onclick="movePlayer('right')"><img class="button-caret" src="./medias/images/icons/caret-right-solid.svg"/></button>
    <button class="cross-button down" onclick="movePlayer('down')"><img class="button-caret" src="./medias/images/icons/caret-down-solid.svg"/></button>
  </div>`;
  document.getElementById('popup').remove();
}
window.continueFishing = continueFishing;

/* ------------------ area ------------------ */
let currentArea = AREAS[0];

document.getElementById('screenArea').style.backgroundImage = `url('./medias/images/areas/${currentArea.img}.gif')`;
currentArea.walkableCells.forEach(cell => {
  document.getElementById(cell).classList.add('walkable');
});
currentArea.swimmableCells.forEach(cell => {
  document.getElementById(cell).classList.add('swimmable');
});

/* ------------------ player ------------------ */

let currentCharacterId = CHARACTERS[3];
const currentCharacter = {
  front: `./medias/images/characters/${currentCharacterId}-front.png`,
  back: `./medias/images/characters/${currentCharacterId}-back.png`,
  left: `./medias/images/characters/${currentCharacterId}-left.png`,
  right: `./medias/images/characters/${currentCharacterId}-right.png`,
};

let currentPlayerLineLetterIndex = currentArea.spawnLine - 1;
let currentPlayerColumn = currentArea.spawnColumn;

const setPlayerSpawn = () => {
  const PLAYER = document.getElementById('player');
  PLAYER.style.backgroundImage = `url(${currentCharacter.front})`;
  PLAYER.style.top = `calc(${currentPlayerLineLetterIndex} * var(--cell-size))`;
  PLAYER.style.left = `calc(${currentPlayerColumn - 1} * var(--cell-size))`;

  setPlayerAvailableCells();
};

const setPlayerAvailableCells = () => {
  let leftCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}`;
  let upCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}`;
  let rightCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}`;
  let downCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn}`;

  setPlayerAvailableCell(document.getElementById(leftCellId));
  setPlayerAvailableCell(document.getElementById(upCellId));
  setPlayerAvailableCell(document.getElementById(rightCellId));
  setPlayerAvailableCell(document.getElementById(downCellId));
}

const setPlayerAvailableCell = (cell) => {
  if (cell != null) {
    if (cell.classList.contains('swimmable')) {
      cell.classList.add('selectable');
    } else {
      cell.classList.add('unselectable');
    }
  }
}
const clearPlayerAvailableCells = () => {
  let leftCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}`;
  let upCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}`;
  let rightCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}`;
  let downCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn}`;

  clearPlayerAvailableCell(document.getElementById(leftCellId));
  clearPlayerAvailableCell(document.getElementById(upCellId));
  clearPlayerAvailableCell(document.getElementById(rightCellId));
  clearPlayerAvailableCell(document.getElementById(downCellId));
}
const clearPlayerAvailableCell = (cell) => {
  if (cell != null) {
    cell.classList.remove('selectable');
    cell.classList.remove('unselectable');
    cell.classList.remove('selected');
    cell.classList.remove('touched');
  }
}


let isPlayerMoving = false;

const movePlayer = (direction) => {
  if (!isPlayerMoving) {
    isPlayerMoving = true;
    const PLAYER = document.getElementById('player');
    clearPlayerAvailableCells();
    if (direction == 'left') {
      PLAYER.style.backgroundImage = `url(${currentCharacter.left})`;
      if (currentPlayerColumn != 1) {
        let nextCell = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {
          currentPlayerColumn -= 1;
          PLAYER.style.left = `calc(${currentPlayerColumn - 1} * var(--cell-size))`;
        }
      }
    } else if (direction == 'up') {
      PLAYER.style.backgroundImage = `url(${currentCharacter.back})`;
      if (currentPlayerLineLetterIndex != 0) {
        // calcul prochaine cellule
        let nextCell = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {
          currentPlayerLineLetterIndex -= 1;
          PLAYER.style.top = `calc(${currentPlayerLineLetterIndex} * var(--cell-size))`;
        }
      }
    } else if (direction == 'right') {
      PLAYER.style.backgroundImage = `url(${currentCharacter.right})`;
      if (currentPlayerColumn != 16) {
        let nextCell = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {    
          currentPlayerColumn += 1;
          PLAYER.style.left = `calc(${currentPlayerColumn - 1} * var(--cell-size))`;
        }
      }
    } else if (direction == 'down') {
      PLAYER.style.backgroundImage = `url(${currentCharacter.front})`;
      if (currentPlayerLineLetterIndex != 15) {
        let nextCell = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {
          currentPlayerLineLetterIndex += 1;
          PLAYER.style.top = `calc(${currentPlayerLineLetterIndex} * var(--cell-size))`;
        }
      }
    }
    
    setTimeout(() => {
      isPlayerMoving = false;
      setPlayerAvailableCells();
    }, 200);
  }
}
window.movePlayer = movePlayer;

setPlayerSpawn();

/* --- fish --- */
const FISH_MOVEMENTS_BEFORE_DISPARITION = 50;
let fishes = 0;
let AREA_FISHES = [];
const fishImages = {
  front: `./medias/images/characters/fish-front.png`,
  back: `./medias/images/characters/fish-back.png`,
  left: `./medias/images/characters/fish-left.png`,
  right: `./medias/images/characters/fish-right.png`,
};

const generateFish = (letterIndex, column) => {
  fishes += 1;
  let fish = {
    id: `fish${fishes}`,
    isMoving: false,
    currentLineLetterIndex: letterIndex,
    currentColumn: column,
    intervalId: '',
  };
  AREA_FISHES.push(fish);
  
  document.getElementById('screenArea').innerHTML += `<div id="${fish.id}" class="fish"></div>`;
  
  const FISH = document.getElementById(`${fish.id}`);
  FISH.style.top = `calc(${fish.currentLineLetterIndex} * var(--cell-size))`;
  FISH.style.left = `calc(${fish.currentColumn - 1} * var(--cell-size))`;

  moveFishRandomlyXTimes(AREA_FISHES[AREA_FISHES.length - 1], 1000, randomIntFromInterval(12, 64));
}

// GENERIC
const moveFish = (fish, direction) => {

  const checkSelected = (nextCell, FISH) => {
    if (document.getElementById(nextCell).classList.contains('selected')) {
      clearInterval(fish.intervalId);
      FISH.style.opacity = 1;
      document.getElementById(nextCell).classList.replace('selected', 'touched');

      setTimeout(() => {
        launchBattle(FISH);
      }, 500);
    }
  }
  
  if (!fish.isMoving) {
    fish.isMoving = true;
    const FISH = document.getElementById(`${fish.id}`);
    if (direction == 'left') {
      FISH.style.backgroundImage = `url(${fishImages.left})`;
      if (Number(fish.currentColumn) != 1) {
        let nextCell = `${letters[fish.currentLineLetterIndex]}${Number(fish.currentColumn) - 1}`;
        if (document.getElementById(nextCell).classList.contains('swimmable')) {
          fish.currentColumn = Number(fish.currentColumn) - 1;
          FISH.style.left = `calc(${fish.currentColumn - 1} * var(--cell-size))`;
          checkSelected(nextCell, FISH);
        }
      }
    } else if (direction == 'up') {
      FISH.style.backgroundImage = `url(${fishImages.back})`;
      if (Number(fish.currentLineLetterIndex) != 0) {
        // calcul prochaine cellule
        let nextCell = `${letters[Number(fish.currentLineLetterIndex) - 1]}${fish.currentColumn}`;
        if (document.getElementById(nextCell).classList.contains('swimmable')) {
          fish.currentLineLetterIndex = Number(fish.currentLineLetterIndex) - 1;
          FISH.style.top = `calc(${fish.currentLineLetterIndex} * var(--cell-size))`;
          checkSelected(nextCell, FISH);
        }
      }
    } else if (direction == 'right') {
      FISH.style.backgroundImage = `url(${fishImages.right})`;
      if (Number(fish.currentColumn) != 16) {
        let nextCell = `${letters[fish.currentLineLetterIndex]}${Number(fish.currentColumn) + 1}`;
        if (document.getElementById(nextCell).classList.contains('swimmable')) {    
          fish.currentColumn = Number(fish.currentColumn) + 1;
          FISH.style.left = `calc(${fish.currentColumn - 1} * var(--cell-size))`;
          checkSelected(nextCell, FISH);
        }
      }
    } else if (direction == 'down') {
      FISH.style.backgroundImage = `url(${fishImages.front})`;
      if (Number(fish.currentLineLetterIndex) != 15) {
        let nextCell = `${letters[Number(fish.currentLineLetterIndex) + 1]}${fish.currentColumn}`;
        if (document.getElementById(nextCell).classList.contains('swimmable')) {
          fish.currentLineLetterIndex = Number(fish.currentLineLetterIndex) + 1;
          FISH.style.top = `calc(${fish.currentLineLetterIndex} * var(--cell-size))`;
          checkSelected(nextCell, FISH);
        }
      }
    }
    
    setTimeout(() => {
      fish.isMoving = false;
    }, 200);
  }
};

// GENERIC
const randomlyMoveFish = (fish) => {
  let direction = '';
  let rnd = Math.random();

  // AVEC PAUSE
  if (rnd < 0.2) {
    direction = 'left';
  } else if (rnd <= 0.4) {
    direction = 'up';
  } else if (rnd <= 0.6) {
    direction = 'right';
  } else if (rnd <= 0.8) {
    direction = 'down';
  } else {
    direction = 'none';
  }

  // SANS PAUSE
  /* if (rnd < 0.25) {
    direction = 'left';
  } else if (rnd <= 0.5) {
    direction = 'up';
  } else if (rnd <= 0.75) {
    direction = 'right';
  } else {
    direction = 'down';
  } */

  if (direction != 'none') {
    moveFish(fish, direction);
  }
}

const moveFishRandomlyXTimes = (fish, interval, repetitions) => {
  let compteur = 0;
  fish.intervalId = setInterval(() => {
      if (compteur >= repetitions) {
          clearInterval(fish.intervalId);
          document.getElementById(fish.id).remove();
      } else {
          randomlyMoveFish(fish);
          compteur++;
      }
  }, interval);
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRandomSwimmableCellCoordinates = () => {
  let rndCell = currentArea.swimmableCells[randomIntFromInterval(0, currentArea.swimmableCells.length - 1)];
  const letter = rndCell.charAt(0);
  let column = rndCell.substring(1);
  let letterIndex = letters.indexOf(letter);
  return {letterIndex: letterIndex, column: column};
}

/* let rndCell = getRandomSwimmableCellCoordinates();
generateFish(rndCell.letterIndex, rndCell.column);
setTimeout(() => {
  rndCell = getRandomSwimmableCellCoordinates();
  generateFish(rndCell.letterIndex, rndCell.column);
  setTimeout(() => {
    rndCell = getRandomSwimmableCellCoordinates();
    generateFish(rndCell.letterIndex, rndCell.column);
  }, 2500);
}, 2500); */


const generateFishRandomlyXTimes = (interval, repetitions) => {
  let compteur = 0;
  let intervalId = setInterval(() => {
      if (compteur >= repetitions) {
          clearInterval(intervalId);
      } else {
        let rndCell = getRandomSwimmableCellCoordinates();
        generateFish(rndCell.letterIndex, rndCell.column);
        compteur++;
      }
  }, interval);
}

let rndCell = getRandomSwimmableCellCoordinates();
generateFish(rndCell.letterIndex, rndCell.column);
generateFishRandomlyXTimes(randomIntFromInterval(7134, 14798), 100);

const launchBattle = (domFish) => {
  document.getElementById('buttonsArea').innerHTML = '';
  isSelected = false;
  clearPlayerAvailableCells();

  domFish.remove();

  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup">
      <div class="loss">
        Battaille en cours
      </div>
      <div class="progress-container"><div id="progressBar" class="progress-bar"></div></div>
    </div>
  `;

  document.getElementById('progressBar').style.width = '100%';

  setTimeout(() => {
    let rnd = Math.random();
    
    if (rnd < 0.5) {
      // Battaille foirée
      document.getElementById('popup').innerHTML = ``;
      document.getElementById('popup').innerHTML = `
        <div class="loss">
          Râté, le poisson s'est échappé...
        </div>
      `;
    } else {
      document.getElementById('popup').innerHTML = ``;
      document.getElementById('popup').innerHTML = `
        <div class="loss">
          Félicitation !<br>Vous avez attrapé un ...
        </div>
      `;
    }
    setPlayerAvailableCells();
    document.getElementById('buttonsArea').innerHTML = `<button class="continue-button" onclick="continueFishing()">Continuer</button>`;
  }, 4000);

  //
}