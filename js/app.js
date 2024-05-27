import { AREAS } from "./areas.data.js";
import { CHARACTERS } from "./characters.data.js";
import { requestWakeLock } from "./wakelock.js";

// UTILS

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/* ========================================================================= */
/* ============================== CONSTANTES =============================== */
/* ========================================================================= */
// Lettres des lignes de la grille
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

/* ========================================================================= */
/* ============================ Génération DOM ============================= */
/* ========================================================================= */




/* =============================== Cellules =============================== */

const renderScreenCell = (currentScreenLine, currentColumnNumber) => {
  return `
    <div id="${currentScreenLine}${currentColumnNumber}" class="screen-cell" onclick="onCellClick('${currentScreenLine}${currentColumnNumber}')")>
      <span class="cell-name">${currentScreenLine}${currentColumnNumber}</span>
    </div>
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

// Render de la grille
const renderBlankTemplate = () => {
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
}

/* =============================== Area =============================== */

const renderCurrentArea = () => {
  document.getElementById('topArea').innerHTML = `
    <button onclick="onHomeClick()">menu</button>
    <span>${currentArea.id}</span>
    <button class="vivier-button" onclick="onVivierClick()" disabled>vivier</button>`;
  document.getElementById('screenArea').style.backgroundImage = `url('./medias/images/areas/${currentArea.id}/${currentArea.img}.gif')`;
  currentArea.walkableCells.forEach(cell => {
    document.getElementById(cell).classList.add('walkable');
  });
  currentArea.swimmableCells.forEach(cell => {
    document.getElementById(cell).classList.add('swimmable');
  });
}

/* =============================== Player =============================== */

const getCurrentPlayerSprites = () => {
  return {
    front: `./medias/images/characters/${currentCharacterId}-front.png`,
    back: `./medias/images/characters/${currentCharacterId}-back.png`,
    left: `./medias/images/characters/${currentCharacterId}-left.png`,
    right: `./medias/images/characters/${currentCharacterId}-right.png`,
  }
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

const setPlayerSpawn = () => {
  const PLAYER = document.getElementById('player');
  PLAYER.style.backgroundImage = `url(${currentCharacter.front})`;
  PLAYER.style.top = `calc(${currentPlayerLineLetterIndex} * var(--cell-size))`;
  PLAYER.style.left = `calc(${currentPlayerColumn - 1} * var(--cell-size))`;

  setPlayerAvailableCells();
};

const clearPlayerAvailableCell = (cell) => {
  if (cell != null) {
    cell.classList.remove('selectable');
    cell.classList.remove('unselectable');
    cell.classList.remove('selected');
    cell.classList.remove('touched');
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

/* =============================== Fish =============================== */

const getRandomSwimmableCellCoordinates = () => {
  let rndCell = currentArea.swimmableCells[randomIntFromInterval(0, currentArea.swimmableCells.length - 1)];
  const letter = rndCell.charAt(0);
  let column = rndCell.substring(1);
  let letterIndex = letters.indexOf(letter);
  return {letterIndex: letterIndex, column: column};
}

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

const generateFish = (letterIndex, column) => {
  fishes += 1;
  let fish = {
    id: `fish${fishes}`,
    isMoving: false,
    currentLineLetterIndex: letterIndex,
    currentColumn: column,
    intervalId: '',
  };
  
  document.getElementById('screenArea').innerHTML += `<div id="${fish.id}" class="fish"></div>`;
  
  const FISH = document.getElementById(`${fish.id}`);
  FISH.style.top = `calc(${fish.currentLineLetterIndex} * var(--cell-size))`;
  FISH.style.left = `calc(${fish.currentColumn - 1} * var(--cell-size))`;

  AREA_FISHES.push(fish);
  moveFishRandomlyXTimes(AREA_FISHES[AREA_FISHES.length - 1], 1000, randomIntFromInterval(12, 64));
}

const generateFishRandomlyXTimes = (interval, repetitions) => {
  let compteur = 0;
  fishGeneration = setInterval(() => {
      if (compteur >= repetitions) {
          clearInterval(fishGeneration);
      } else {
        let rndCell = getRandomSwimmableCellCoordinates();
        generateFish(rndCell.letterIndex, rndCell.column);
        compteur++;
      }
  }, interval);
}

/* =============================== Battle =============================== */

// Génération de poisson aléatoire ---------------------------

const getRandomAreaFishType = () => {
  return currentArea.fishes[randomIntFromInterval(0, currentArea.fishes.length - 1)];
};

const getRandomIndividual = (fishType) => {
  // à revoir -------
  let induvidualLength = randomIntFromInterval(fishType.minLength, fishType.maxLength);
  let induvidualMass = randomIntFromInterval(fishType.minMass, fishType.maxMass);
  // ----------------
  let individualSaturation = randomIntFromInterval(50, 100);

  return {
    id: fishType.id,
    length: induvidualLength,
    mass: induvidualMass,
    saturation: individualSaturation,
  }
}

const getFishById = (id) => {
  return currentArea.fishes.filter((fish) => fish.id == id)[0];
}

const getIndividualFishCard = (individualFish) => {
  const baseFish = getFishById(individualFish.id);

  return `
    <div class="fish-card">
      <div class="fish-card-bloc fish-name">
        <span>${baseFish.commonName}</span>
        <span>(${baseFish.scientificName})</span>
      </div>
      <img class="fish-card-img" style="" src="./medias/images/areas/${currentArea.id}/fishes/${baseFish.img}.png" />
      <div class="fish-card-bloc">
        <span>Taille : ${individualFish.length}cm</span>
        <span>Poids : ${individualFish.mass}g</span>
      </div>
    </div>
  `;
}

// Battle -------------------------

const launchBattle = (domFish) => {
  isSelected = false;
  clearPlayerAvailableCells();
  domFish.remove();

  document.getElementById('buttonsArea').innerHTML = '';

  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup">
      <span>Lutte acharnée en cours !</span>
      <div class="progress-container"><div id="progressBar" class="progress-bar"></div></div>
    </div>
  `;

  setTimeout(() => {
    let rnd = Math.random();
    
    if (rnd < 0.5) { // Bataille foirée
      document.getElementById('popup').innerHTML = ``;
      document.getElementById('popup').innerHTML = `
        <span>Râté, le poisson s'est échappé...</span>
      `;
    } else { // Bataille gagnée
      document.getElementById('popup').innerHTML = ``;
      document.getElementById('popup').innerHTML = `
        <span>
          Félicitation !<br>
          Vous avez attrapé :
        </span>
        ${getIndividualFishCard(getRandomIndividual(getRandomAreaFishType()))}
      `;
    }
    setPlayerAvailableCells();
    document.getElementById('buttonsArea').innerHTML = `<button class="continue-button" onclick="continueFishing()">Continuer</button>`;
  }, 3500);
}

/* ========================================================================= */
/* ======================= Interactions utilisateur ======================== */
/* ========================================================================= */

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

/* ========================================================================= */
/* =============================== EXECUTION =============================== */
/* ========================================================================= */

const renderHomeTemplate = () => {
  document.getElementById('main').innerHTML = `
  <div id="topArea" class="top-area">
    <span></span>
    <span>a fishfull life</span>
    <span></span>
  </div>
    <div id="screenArea" class="screen-area home-screen">
      <button class="home-screen-button" onclick="onPlayClick()">jouer</button>
      <button class="home-screen-button" onclick="onCustomizeClick()" disabled>personnaliser</button>
      <button class="home-screen-button" onclick="onRecordsClick()" disabled>records</button>
    </div>
    <div id="buttonsArea" class="buttons-area home-screen">
    </div>
  `;
}

const onPlayClick = () => {
  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup home-screen">
      <div class="popup-top">
        <span>Destination</span>
        <button class="close-popup-button" onclick="onClosePopupClick()">X</button>
      </div>
      <div class="area-selector">

        <div class="area-line">
          <button class="area-button" onclick="onAreaButtonClick(0)">
            <img src="./medias/images/areas/france/france.gif" />
            <span>france</span>
          </button>
          <button class="area-button" onclick="onAreaButtonClick()" disabled>
            <div class="no-img"></div>
            <span>???</span>
          </button>
        </div>

        <div class="area-line">
          <button class="area-button" onclick="onAreaButtonClick()" disabled>
          <div class="no-img"></div>
            <span>???</span>
          </button>
          <button class="area-button" onclick="onAreaButtonClick()" disabled>
          <div class="no-img"></div>
            <span>???</span>
          </button>
        </div>

        <div class="area-line">
          <button class="area-button" onclick="onAreaButtonClick()" disabled>
          <div class="no-img"></div>
            <span>???</span>
          </button>
        </div>

      </div>
    </div>
  `;
}
window.onPlayClick = onPlayClick;

const onAreaButtonClick = (areaIndex) => {
  defineArea(AREAS[areaIndex]);
}
window.onAreaButtonClick = onAreaButtonClick;

const onRecordsClick = () => {
  console.log('click records');
}
window.onRecordsClick = onRecordsClick;

const onCustomizeClick = () => {
  console.log('click customize');
}
window.onCustomizeClick = onCustomizeClick;

const onClosePopupClick = () => {
  document.getElementById('popup').remove();
}
window.onClosePopupClick = onClosePopupClick;



const onHomeClick = () => {
  AREA_FISHES.forEach(fish => {
    clearInterval(fish.intervalId);
  });
  clearInterval(fishGeneration);
  renderHomeTemplate();
  AREA_FISHES = [];
}
window.onHomeClick = onHomeClick;

const renderVivierFishCard = (fish) => {
  return `
    <div class="vivier-fish-card">
      <img src="./medias/images/areas/${currentArea.id}/fishes/${fish.img}.png" />
      <div>
        <span>${fish.commonName}</span>
        <span>(${fish.scientificName})</span>
        <!--<span>de ${fish.minLength}cm à ${fish.maxLength}cm</span>
        <span>de ${fish.minMass}g à ${fish.maxMass}g</span>-->
      </div>
    </div>
  `;
}

const renderAreaVivier = () => {
  let txt = '';
  currentArea.fishes.forEach(fish => {
    txt += renderVivierFishCard(fish);
  });
  return `
    <div class="area-vivier">
      ${txt}
    </div>
  `;
}

const onVivierClick = () => {
  //console.table(currentArea.fishes);
  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup vivier">
      <div class="popup-top">
        <span>Vivier</span>
        <button class="close-popup-button" onclick="onClosePopupClick()">X</button>
      </div>
      ${renderAreaVivier()}
    </div>
  `;
}
window.onVivierClick = onVivierClick;




await requestWakeLock();
//
renderHomeTemplate();


const defineArea = (area) => {
  renderBlankTemplate();
  currentArea = area;
  currentPlayerLineLetterIndex = currentArea.spawnLine - 1;
  currentPlayerColumn = currentArea.spawnColumn;
  renderCurrentArea();
  setPlayerSpawn();
  AREA_FISHES = [];
  let rndCell = getRandomSwimmableCellCoordinates();
  generateFish(rndCell.letterIndex, rndCell.column);
  generateFishRandomlyXTimes(randomIntFromInterval(7134, 14798), 1000);
}

let currentArea = AREAS[0];

let isSelected = false;
let fishGeneration = '';

let currentCharacterId = CHARACTERS[3];
let currentPlayerLineLetterIndex = currentArea.spawnLine - 1;
let currentPlayerColumn = currentArea.spawnColumn;

let isPlayerMoving = false;
let currentCharacter = getCurrentPlayerSprites();

let fishes = 0;
let AREA_FISHES = [];
const fishImages = {
  front: `./medias/images/characters/fish-front.png`,
  back: `./medias/images/characters/fish-back.png`,
  left: `./medias/images/characters/fish-left.png`,
  right: `./medias/images/characters/fish-right.png`,
};











