import { AREAS } from "./areas.data.js";
import { CHARACTERS } from "./characters.data.js";
/* ========================================================================= */
/* =============================== EXECUTION =============================== */
/* ========================================================================= */

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

const renderScreenCell = (currentScreenLine, currentColumnNumber) => {
  return `
    <div id="${currentScreenLine}${currentColumnNumber}" class="screen-cell"><span class="cell-name">${currentScreenLine}${currentColumnNumber}</span></div>
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
  <div class="buttons-area">
    <div class="cross-container">
      <button class="cross-button left" onclick="movePlayer('left')"><img class="button-caret" src="./medias/images/icons/caret-left-solid.svg"/></button>
      <button class="cross-button up" onclick="movePlayer('up')"><img class="button-caret" src="./medias/images/icons/caret-up-solid.svg"/></button>
      <button class="cross-button right" onclick="movePlayer('right')"><img class="button-caret" src="./medias/images/icons/caret-right-solid.svg"/></button>
      <button class="cross-button down" onclick="movePlayer('down')"><img class="button-caret" src="./medias/images/icons/caret-down-solid.svg"/></button>
    </div>
  </div>
`;

/* ------------------ area ------------------ */
let currentArea = AREAS[0];

document.getElementById('screenArea').style.backgroundImage = `url('./medias/images/areas/${currentArea.img}.gif')`;
currentArea.walkableCells.forEach(cell => {
  document.getElementById(cell).classList.add('walkable');
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
};

let isPlayerMoving = false;

const movePlayer = (direction) => {
  if (!isPlayerMoving) {
    isPlayerMoving = true;
    const PLAYER = document.getElementById('player');
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
    }, 200);
  }
}
window.movePlayer = movePlayer;

setPlayerSpawn();