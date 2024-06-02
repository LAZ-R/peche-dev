import { APP_VERSION } from "../properties.js";
import { AREAS } from "./areas.data.js";
import { CHARACTERS } from "./characters.data.js";
import { getUser, getUserSetting, setStorage, setUser } from "./storage.js";
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

const minSpawnTime = 7134;
const maxSpawnTime = 14798;

const minFishMovement = 16;
const maxFishMovement = 64;

/* ========================================================================= */
/* ============================ Génération DOM ============================= */
/* ========================================================================= */

/* ############################### Home page ############################### */

const renderHomeTemplate = () => {
  document.getElementById('main').innerHTML = `
  <div id="topArea" class="top-area">
    <span style="width: 90px;"></span>
    <span>a fishfull life</span>
    <button id="settingsButton" style="width: 90px;" onclick="onSettingsClick()"><img src="./medias/images/icons/gear-solid.svg" /></button>
  </div>
    <div id="screenArea" class="screen-area home-screen">
      <div id="homeButtonsArea" class="home-buttons-area">
        <button id="playButton" class="home-screen-button" onclick="onPlayClick()">jouer</button>
        <button id="recordsButton" class="home-screen-button" onclick="onRecordsClick()">records</button>
        <button id="cabinButton" onclick="onCabinClick()">cabane</button>
      </div>
    </div>
    <div id="buttonsArea" class="buttons-area home-screen">
    </div>
    <span id="versionNumber" style="margin-top: auto; margin-bottom: 2svh; transition: opacity .5s linear;">v ${APP_VERSION}</span>
  `;
}

/* const home_music = new Audio('.');
home_music.preload(); */

const openAppCinematic = (isHome) => {
  renderHomeTemplate();

  if (isHome) {
    document.getElementById('cabinButton').setAttribute('disabled', true);
    document.getElementById('topArea').style.opacity = 0;
    document.getElementById('playButton').style.opacity = 0;
    //document.getElementById('cabinButton').style.opacity = 0;
    document.getElementById('recordsButton').style.opacity = 0;
    document.getElementById('screenArea').style.opacity = 0;
    document.getElementById('buttonsArea').style.opacity = 0;
    document.getElementById('versionNumber').style.opacity = 0;
  }
  
  if (isHome) {
    document.getElementById('main').style.opacity = 1;
  } else {
    setTimeout(() => {
      document.getElementById('main').style.opacity = 1;
    }, 500);
  }

  if (isHome) {
    setTimeout(() => {
      document.getElementById('screenArea').style.opacity = 1;
      document.getElementById('buttonsArea').style.opacity = 1;
      setTimeout(() => {
        document.getElementById('topArea').style.opacity = 1;
        setTimeout(() => { 
          document.getElementById('playButton').style.opacity = 1;
          setTimeout(() => { 
            document.getElementById('recordsButton').style.opacity = .5;
            setTimeout(() => {
              document.getElementById('versionNumber').style.opacity = 1;
              document.getElementById('cabinButton').removeAttribute('disabled');
              // Futur bouton paramètres
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }
  
}

const fromHomeToArea = (area) => {
  document.getElementById('main').style.opacity = 0;
  setTimeout(() => {
    if (area != undefined) {
      defineArea(area);
    } else {
      defineCabin();
    }
    setTimeout(() => {
      document.getElementById('main').style.opacity = 1;
    }, 500);
  }, 500);
}

const fromAreaToHome = (area) => {
  document.getElementById('main').style.opacity = 0;
  setTimeout(() => {
    openAppCinematic();
  }, 500);
}

const defineCabin = () => {
  document.getElementById('versionNumber').remove();

  document.getElementById('screenArea').innerHTML = '';
  document.getElementById('screenArea').classList.remove('home-screen');
  document.getElementById('screenArea').style.backgroundImage = `url('./medias/images/areas/cabin/cabin.png')`;

  document.getElementById('topArea').innerHTML = `
    <button id="homeButton" onclick="onHomeClick(true)">accueil</button>
    <span>la cabane</span>
    <span class="vivier-button"></span>
  `;
}

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
  generateFishRandomlyXTimes();
}

/* ############################### Area page ############################### */

/* ================================ Top part ================================ */
const renderVivierFishCard = (fish) => {
  let user = getUser();
  let hasBeenCatch = false;
  let bestNotation = 0;

  user.catches.forEach(catchedFish => {
    //console.log(catchedFish.fishId);
    if (fish.id == catchedFish.fishId) {
      //console.log('has been catched');
      hasBeenCatch = true;
      if (catchedFish.notation > bestNotation) {
        bestNotation = catchedFish.notation;
      }
    }
  });

  const imgSrc = fish.img == '' ? `./medias/images/no-picture.png` : `./medias/images/areas/${currentArea.id}/fishes/${fish.img}.png`;
  return `
    <div class="vivier-fish-card ${hasBeenCatch ? '' : 'uncatched'}">
      <img src="${imgSrc}" />
      <div>
        <span>${fish.commonName}</span>
        <span>(${fish.scientificName})</span>
        </div>
        ${hasBeenCatch ?  `<div class="notation-area small">${getNotationImages(bestNotation)}</div>` : ''}
    </div>
  `;
}
/* <span>de ${fish.minLength}cm à ${fish.maxLength}cm</span>
        <span>de ${fish.minMass}g à ${fish.maxMass}g</span> */

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

const setTouchEventCross = () => {
  let stillNeedToMove = true;

  // LEFT ------------------
  const crossLeft = document.getElementById('crossLeft');
  let leftTouchEventIntervalId = '';

  crossLeft.addEventListener('touchstart', (event) => {
    event.preventDefault();
    stillNeedToMove = true;
    crossLeft.classList.add('pressed');

    movePlayer('left');

    setTimeout(() => {
      if (stillNeedToMove) {
        leftTouchEventIntervalId = setInterval(() => {
          movePlayer('left');
        }, 100);
      }
    }, 50);
  });

  crossLeft.addEventListener('touchend', (event) => {
    event.preventDefault();
    stillNeedToMove = false;
    clearInterval(leftTouchEventIntervalId);
    crossLeft.classList.remove('pressed');
  });

  // UP ------------------
  const crossUp = document.getElementById('crossUp');
  let upTouchEventIntervalId = '';

  crossUp.addEventListener('touchstart', (event) => {
    event.preventDefault();
    stillNeedToMove = true;
    crossUp.classList.add('pressed');

    movePlayer('up');

    setTimeout(() => {
      if (stillNeedToMove) {
        upTouchEventIntervalId = setInterval(() => {
          movePlayer('up');
        }, 100);
      }
    }, 50);
  });

  crossUp.addEventListener('touchend', (event) => {
    event.preventDefault();
    stillNeedToMove = false;
    clearInterval(upTouchEventIntervalId);
    crossUp.classList.remove('pressed');
  });

  // RIGHT ------------------
  const crossRight = document.getElementById('crossRight');
  let rightTouchEventIntervalId = '';

  crossRight.addEventListener('touchstart', (event) => {
    event.preventDefault();
    stillNeedToMove = true;
    crossRight.classList.add('pressed');

    movePlayer('right');

    setTimeout(() => {
      if (stillNeedToMove) {
        rightTouchEventIntervalId = setInterval(() => {
          movePlayer('right');
        }, 100);
      }
    }, 50);
  });

  crossRight.addEventListener('touchend', (event) => {
    event.preventDefault();
    stillNeedToMove = false;
    clearInterval(rightTouchEventIntervalId);
    crossRight.classList.remove('pressed');
  });

  // RIGHT ------------------
  const crossDown = document.getElementById('crossDown');
  let downTouchEventIntervalId = '';

  crossDown.addEventListener('touchstart', (event) => {
    event.preventDefault();
    stillNeedToMove = true;
    crossDown.classList.add('pressed');

    movePlayer('down');

    setTimeout(() => {
      if (stillNeedToMove) {
        downTouchEventIntervalId = setInterval(() => {
          movePlayer('down');
        }, 100);
      }
    }, 50);
  });

  crossDown.addEventListener('touchend', (event) => {
    event.preventDefault();
    stillNeedToMove = false;
    clearInterval(downTouchEventIntervalId);
    crossDown.classList.remove('pressed');
  });
}

// Render de la grille
const renderBlankTemplate = () => {
  document.getElementById('main').innerHTML = `
  <div id="topArea" class="top-area"></div>
    <div id="screenArea" class="screen-area">
      <div id="player" class="player"></div>
      <div id="over" class="over"></div>
      ${renderScreenLines()}
    </div>
    <div id="buttonsArea" class="buttons-area">
      ${getCrossContainer()}
      ${getHistoryContainer()}
    </div>
  `;
  setTouchEventCross();
}

const getCrossContainer = () => {
  return `
    <div class="cross-container">
      <button id="crossLeft" class="cross-button left" onclick="movePlayer('left')"></button>
      <button id="crossUp" class="cross-button up" onclick="movePlayer('up')"></button>
      <button id="crossRight" class="cross-button right" onclick="movePlayer('right')"></button>
      <button id="crossDown" class="cross-button down" onclick="movePlayer('down')"></button>
    </div>`;
}

const getHistoryContainer = () => {
  return `
    <div class="history-container">
      <span class="title">Prises de la session</span>
      <div class="history-data">
        ${getHistoryFishCards()}
      </div>
    </div>`;
}

const getHistoryFishCard = (fish) => {
  return `
    <div class="history-fish-card">
      <img src="./medias/images/areas/${currentArea.id}/fishes/${fish.id}.png" />
      <div class="notation-area small">${getNotationImages(fish.notation)}</div>
    </div>
  `;
}

const getHistoryFishCards = () => {
  let str = '';
  currentAreaCatches.toReversed().forEach(fish => {
    str += getHistoryFishCard(fish);
  });
  return str
}

/* =============================== Area =============================== */

const renderCurrentArea = () => {
  document.getElementById('topArea').innerHTML = `
    <button id="homeButton" onclick="onHomeClick()">accueil</button>
    <span>${currentArea.id}</span>
    <button id="vivierButton" class="vivier-button" onclick="onVivierClick()">vivier</button>`;

  document.getElementById('screenArea').style.backgroundImage = `url('./medias/images/areas/${currentArea.id}/${currentArea.img}.webp')`;
  if (currentArea.imgOver != undefined) {
    document.getElementById('over').style.backgroundImage = `url('./medias/images/areas/${currentArea.id}/${currentArea.imgOver}.webp')`;
  }
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
    front: `./medias/images/characters/${currentCharacterId}-front.webp`,
    frontRightFoot: `./medias/images/characters/${currentCharacterId}-front-rf.webp`,
    frontLeftFoot: `./medias/images/characters/${currentCharacterId}-front-lf.webp`,
    back: `./medias/images/characters/${currentCharacterId}-back.webp`,
    backRightFoot: `./medias/images/characters/${currentCharacterId}-back-rf.webp`,
    backLeftFoot: `./medias/images/characters/${currentCharacterId}-back-lf.webp`,
    left: `./medias/images/characters/${currentCharacterId}-left.webp`,
    leftMoving: `./medias/images/characters/${currentCharacterId}-left-moving.webp`,
    right: `./medias/images/characters/${currentCharacterId}-right.webp`,
    rightMoving: `./medias/images/characters/${currentCharacterId}-right-moving.webp`,
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
  // Canne à pêche 1

  let leftCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}`;
  let upCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}`;
  let rightCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}`;
  let downCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn}`;

  setPlayerAvailableCell(document.getElementById(leftCellId));
  setPlayerAvailableCell(document.getElementById(upCellId));
  setPlayerAvailableCell(document.getElementById(rightCellId));
  setPlayerAvailableCell(document.getElementById(downCellId));

  if (currentRod == 2 || currentRod == 3) {
    // Canne à pêche 2
  
    let left2CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 2}`;
    let leftUpCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn - 1}`;
    let up2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn}`;
    let upRightCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn + 1}`;
    let right2CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 2}`;
    let rightDownCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn + 1}`;
    let down2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn}`;
    let downLeftCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn - 1}`;

    setPlayerAvailableCell(document.getElementById(left2CellId));
    setPlayerAvailableCell(document.getElementById(leftUpCellId));
    setPlayerAvailableCell(document.getElementById(up2CellId));
    setPlayerAvailableCell(document.getElementById(upRightCellId));
    setPlayerAvailableCell(document.getElementById(right2CellId));
    setPlayerAvailableCell(document.getElementById(rightDownCellId));
    setPlayerAvailableCell(document.getElementById(down2CellId));
    setPlayerAvailableCell(document.getElementById(downLeftCellId));

    if (currentRod == 3) {
      // Canne à pêche 3
    
      let left3CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 3}`;
      let left2Up1CellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn - 2}`;
      //let left2Up2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn - 2}`;
      let left1Up2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn - 1}`;
      let up3CellId = `${letters[currentPlayerLineLetterIndex - 3]}${currentPlayerColumn}`;
      let up2Right1CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn + 1}`;
      //let up2Right2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn + 2}`;
      let up1Right2CellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn + 2}`;
      let right3CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 3}`;
      let right2Down1CellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn + 2}`;
      //let right2Down2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn + 2}`;
      let right1Down2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn + 1}`;
      let down3CellId = `${letters[currentPlayerLineLetterIndex + 3]}${currentPlayerColumn}`;
      let down2Left1CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn - 1}`;
     // let down2Left2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn - 2}`;
      let down1Left2CellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn - 2}`;
  
      setPlayerAvailableCell(document.getElementById(left3CellId));
      setPlayerAvailableCell(document.getElementById(left2Up1CellId));
      //setPlayerAvailableCell(document.getElementById(left2Up2CellId));
      setPlayerAvailableCell(document.getElementById(left1Up2CellId));
      setPlayerAvailableCell(document.getElementById(up3CellId));
      setPlayerAvailableCell(document.getElementById(up2Right1CellId));
      //setPlayerAvailableCell(document.getElementById(up2Right2CellId));
      setPlayerAvailableCell(document.getElementById(up1Right2CellId));
      setPlayerAvailableCell(document.getElementById(right3CellId));
      setPlayerAvailableCell(document.getElementById(right2Down1CellId));
      //setPlayerAvailableCell(document.getElementById(right2Down2CellId));
      setPlayerAvailableCell(document.getElementById(right1Down2CellId));
      setPlayerAvailableCell(document.getElementById(down3CellId));
      setPlayerAvailableCell(document.getElementById(down2Left1CellId));
      //setPlayerAvailableCell(document.getElementById(down2Left2CellId));
      setPlayerAvailableCell(document.getElementById(down1Left2CellId));
    }
  }
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

  if (currentRod == 2 || currentRod == 3) {
    // Canne à pêche 2
  
    let left2CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 2}`;
    let leftUpCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn - 1}`;
    let up2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn}`;
    let upRightCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn + 1}`;
    let right2CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 2}`;
    let rightDownCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn + 1}`;
    let down2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn}`;
    let downLeftCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn - 1}`;

    clearPlayerAvailableCell(document.getElementById(left2CellId));
    clearPlayerAvailableCell(document.getElementById(leftUpCellId));
    clearPlayerAvailableCell(document.getElementById(up2CellId));
    clearPlayerAvailableCell(document.getElementById(upRightCellId));
    clearPlayerAvailableCell(document.getElementById(right2CellId));
    clearPlayerAvailableCell(document.getElementById(rightDownCellId));
    clearPlayerAvailableCell(document.getElementById(down2CellId));
    clearPlayerAvailableCell(document.getElementById(downLeftCellId));

    if (currentRod == 3) {
      // Canne à pêche 3
    
      let left3CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 3}`;
      let left2Up1CellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn - 2}`;
      //let left2Up2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn - 2}`;
      let left1Up2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn - 1}`;
      let up3CellId = `${letters[currentPlayerLineLetterIndex - 3]}${currentPlayerColumn}`;
      let up2Right1CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn + 1}`;
      //let up2Right2CellId = `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn + 2}`;
      let up1Right2CellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn + 2}`;
      let right3CellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 3}`;
      let right2Down1CellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn + 2}`;
      //let right2Down2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn + 2}`;
      let right1Down2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn + 1}`;
      let down3CellId = `${letters[currentPlayerLineLetterIndex + 3]}${currentPlayerColumn}`;
      let down2Left1CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn - 1}`;
      //let down2Left2CellId = `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn - 2}`;
      let down1Left2CellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn - 2}`;
  
      clearPlayerAvailableCell(document.getElementById(left3CellId));
      clearPlayerAvailableCell(document.getElementById(left2Up1CellId));
      //clearPlayerAvailableCell(document.getElementById(left2Up2CellId));
      clearPlayerAvailableCell(document.getElementById(left1Up2CellId));
      clearPlayerAvailableCell(document.getElementById(up3CellId));
      clearPlayerAvailableCell(document.getElementById(up2Right1CellId));
      //clearPlayerAvailableCell(document.getElementById(up2Right2CellId));
      clearPlayerAvailableCell(document.getElementById(up1Right2CellId));
      clearPlayerAvailableCell(document.getElementById(right3CellId));
      clearPlayerAvailableCell(document.getElementById(right2Down1CellId));
      //clearPlayerAvailableCell(document.getElementById(right2Down2CellId));
      clearPlayerAvailableCell(document.getElementById(right1Down2CellId));
      clearPlayerAvailableCell(document.getElementById(down3CellId));
      clearPlayerAvailableCell(document.getElementById(down2Left1CellId));
      //clearPlayerAvailableCell(document.getElementById(down2Left2CellId));
      clearPlayerAvailableCell(document.getElementById(down1Left2CellId));
    }
  }
}

const applyCharacterImgFromSelectedCell = (cellId) => {
  const PLAYER = document.getElementById('player');

  if ( // LEFT ---------------------------------------------
    cellId == `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}` ||
    cellId == `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 2}` ||
    cellId == `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 3}` ||
    cellId == `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn - 2}` ||
    cellId == `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn - 2}` 
  ) {
    PLAYER.style.backgroundImage = `url(${currentCharacter.left})`;
  } else if (
    cellId == `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}` ||
    cellId == `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn}` ||
    cellId == `${letters[currentPlayerLineLetterIndex - 3]}${currentPlayerColumn}` ||
    cellId == `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn - 1}` ||
    cellId == `${letters[currentPlayerLineLetterIndex - 2]}${currentPlayerColumn + 1}` 
  ) {
    PLAYER.style.backgroundImage = `url(${currentCharacter.back})`;
  } else if (
    cellId == `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}` ||
    cellId == `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 2}` ||
    cellId == `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 3}` ||
    cellId == `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn + 2}` ||
    cellId == `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn + 2}` 
  ) {
    PLAYER.style.backgroundImage = `url(${currentCharacter.right})`;
  } else if (
    cellId == `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn}` ||
    cellId == `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn}` ||
    cellId == `${letters[currentPlayerLineLetterIndex + 3]}${currentPlayerColumn}` ||
    cellId == `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn + 1}` ||
    cellId == `${letters[currentPlayerLineLetterIndex + 2]}${currentPlayerColumn - 1}` 
  ) {
    PLAYER.style.backgroundImage = `url(${currentCharacter.front})`;
  } else {
    /* leftUpCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn - 1}`;
    upRightCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn + 1}`;
    rightDownCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn + 1}`;
    downLeftCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn - 1}`; */
  }
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
      document.getElementById(nextCell).classList.replace('selected', 'touched');
      clearInterval(fish.intervalId);
      FISH.style.opacity = 1;
      document.getElementById('buttonsArea').innerHTML = ``;

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
  moveFishRandomlyXTimes(AREA_FISHES[AREA_FISHES.length - 1], 1000, randomIntFromInterval(minFishMovement, maxFishMovement));
}

const generateFishRandomlyXTimes = () => {
  fishGeneration = setInterval(() => {
    let rndCell = getRandomSwimmableCellCoordinates();
    generateFish(rndCell.letterIndex, rndCell.column);
  }, randomIntFromInterval(minSpawnTime, maxSpawnTime));
}

/* =============================== Battle =============================== */

// Génération de poisson aléatoire ---------------------------

const getRandomAreaFishType = () => {
  return currentArea.fishes[randomIntFromInterval(0, currentArea.fishes.length - 1)];
};

const getRandomIndividual = (fishType) => {
  let induvidualLength = randomIntFromInterval(fishType.minLength, fishType.maxLength);

  // Définir une relation linéaire entre taille et masse
  const slope = (fishType.maxMass - fishType.minMass) / (fishType.maxLength - fishType.minLength);
  const intercept = fishType.minMass - slope * fishType.minLength;

  // Calculer la masse attendue basée sur la taille
  const expectedMass = slope * induvidualLength + intercept;

  // Ajouter une variabilité à la masse (ici on utilise une variabilité de ±10% de la masse attendue)
  const variability = 0.1; // 10%
  const minMassWithVariability = expectedMass * (1 - variability);
  const maxMassWithVariability = expectedMass * (1 + variability);

  let induvidualMass = randomIntFromInterval(
    Math.max(fishType.minMass, Math.floor(minMassWithVariability)),
    Math.min(fishType.maxMass, Math.ceil(maxMassWithVariability))
  );
  // ----------------

  let lengthPercentage = ((induvidualLength - fishType.minLength) / (fishType.maxLength - fishType.minLength)) * 100;
  let massPercentage = ((induvidualMass - fishType.minMass) / (fishType.maxMass - fishType.minMass)) * 100;

  let lengthNotation = lengthPercentage < 25 ? 0 : lengthPercentage <= 50 ? 1 : lengthPercentage <= 75 ? 2 : 3;
  let massNotation = massPercentage < 25 ? 0 : massPercentage <= 50 ? 1 : massPercentage <= 75 ? 2 : 3;

  let individualNotation = Math.ceil((lengthNotation + massNotation) / 2);

  return {
    id: fishType.id,
    length: induvidualLength,
    mass: induvidualMass,
    notation: individualNotation,
  }
}

const getFishById = (id) => {
  return currentArea.fishes.filter((fish) => fish.id == id)[0];
}

const getBestCatchedFishInfos = (fishId) => {
  let bestLength = 0;
  let bestMass = 0;
  let user = getUser();

  user.catches.forEach(catchedFish => {
    if (catchedFish.fishId == fishId) {
      if (catchedFish.fishLength > bestLength) {
        bestLength = catchedFish.fishLength;
      }
      if (catchedFish.fishMass > bestMass) {
        bestMass = catchedFish.fishMass;
      }
    }
  });

  return {
    bestLength: bestLength,
    bestMass: bestMass,
  }
}

const getIndividualFishCard = (individualFish) => {
  const baseFish = getFishById(individualFish.id);
  const imgSrc = baseFish.img == '' ? `./medias/images/no-picture.png` : `./medias/images/areas/${currentArea.id}/fishes/${baseFish.img}.png`;

  const previousBest = getBestCatchedFishInfos(individualFish.id);
  const isBestLength = individualFish.length > previousBest.bestLength;
  const isBestMass = individualFish.mass > previousBest.bestMass;

  const hasAlreadyBeenCatched = hasFishAlreadyBeenCatched(individualFish.id);

  return `
    <div class="fish-card">
      ${!hasAlreadyBeenCatched ? `<div class="new-fish">nouveau</div>` : ''}
      <div class="fish-card-bloc fish-name">
        <span>${baseFish.commonName}</span>
        <span>(${baseFish.scientificName})</span>
      </div>
      <img class="fish-card-img" style="" src="${imgSrc}" />
      <div class="fish-card-bloc">
        <span><span>Taille : ${individualFish.length}cm</span>${isBestLength && hasAlreadyBeenCatched ? `<span class="best">record</span>` : ''}</span>
        <span><span>Poids : ${individualFish.mass}g</span>${isBestMass && hasAlreadyBeenCatched ? `<span class="best">record</span>` : ''}</span>
        <div class="notation-area">${getNotationImages(individualFish.notation)}</div>
      </div>
    </div>
  `;
}

const getNotationImages = (notation) => {
  return `
    <img src="${notation > 0 ? './medias/images/icons/star-solid.svg' : './medias/images/icons/star-regular.svg'}" class="${notation > 0 ? 'turned-on' : 'turned-off'}" />
    <img src="${notation > 1 ? './medias/images/icons/star-solid.svg' : './medias/images/icons/star-regular.svg'}" class="${notation > 1 ? 'turned-on' : 'turned-off'}" />
    <img src="${notation > 2 ? './medias/images/icons/star-solid.svg' : './medias/images/icons/star-regular.svg'}" class="${notation > 2 ? 'turned-on' : 'turned-off'}" />
  `;
}

// Battle -------------------------

const launchBattle = (domFish) => {
  document.getElementById('vivierButton').setAttribute('disabled', true);

  isSelected = false;
  clearPlayerAvailableCells();
  domFish.remove();

  document.getElementById('buttonsArea').innerHTML = '';

  // récupération message aléatoire
  const battleMessages = [
    `Combat intense en cours !`,
    `Remontée en progression...`,
    `Ça avance, on lâche rien !`,
    `Lutte acharnée en cours !`,
    `On s'accroche, ça tire fort !`,
    `La prise est amorcée !`,
    `Ligne tendue, effort constant...`,
    `On tire, encore un peu !`,
    `La bataille est lancée !`,
  ];

  let previousPopup = document.getElementById('popup');
  if (previousPopup != null) {
    previousPopup.remove();
  }

  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup">
      <span>${battleMessages[randomIntFromInterval(0, battleMessages.length - 1)]}</span>
      <div class="progress-container"><div id="progressBar" class="progress-bar"></div></div>
    </div>
  `;

  setTimeout(() => {
    let rnd = Math.random();
    
    if (rnd < 0.33) { // Bataille foirée
      // récupération message aléatoire
      const failMessages = [
        `Zut !<br>Le poisson s'est enfui...`,
        `Mince alors !<br>Le poisson a réussi à s'échapper...`,
        `Ah, pas de chance !<br>Le poisson a filé...`,
        `Oh non !<br>Le poisson a réussi à s'échapper...`,
        `Raté !<br>Le poisson s'est libéré...`,
        `Oups !<br>Le poisson a pris la fuite...`,
        `Dommage !<br>Le poisson est parti...`,
        `Ah, c'est manqué !<br>Le poisson a disparu...`,
        `Pas cette fois !<br>Le poisson s'est échappé...`,
        `Tant pis !<br>Le poisson a réussi à s'enfuir...`,
      ];
      document.getElementById('popup').innerHTML = ``;
      document.getElementById('popup').innerHTML = `
        <span>${failMessages[randomIntFromInterval(0, failMessages.length - 1)]}</span>
      `;
    } else { // Bataille gagnée
      // récupération message aléatoire
      const INDIVIDUAL = getRandomIndividual(getRandomAreaFishType());

      const winMessages = [
        `Félicitations !`,
        `Bravo !`,
        `Bien joué !`,
        `Super !`,
        `Excellent !`,
        `Chapeau !`,
        `Magnifique !`,
        `Génial !`,
        `Parfait !`,
        `Impressionnant !`,
        `Splendide !`,
        `Fantastique !`,
        `Incroyable !`,
        `Épatant !`,
        `Admirable !`,
        `Remarquable !`,
        `Sensationnel !`,
      ];
      document.getElementById('popup').innerHTML = ``;
      document.getElementById('popup').innerHTML = `
        <span>
          ${winMessages[randomIntFromInterval(0, winMessages.length - 1)]}<br>
          Vous avez attrapé :
        </span>
        ${getIndividualFishCard(INDIVIDUAL)}
      `;

      const STORAGE_INDIVIDUAL = {
        areaId: currentArea.id,
        fishId: INDIVIDUAL.id,
        fishLength: INDIVIDUAL.length,
        fishMass: INDIVIDUAL.mass,
        notation: INDIVIDUAL.notation
      }

      let user = getUser();
      user.catches.push(STORAGE_INDIVIDUAL);
      setUser(user);

      let areaCatch = {
        id: INDIVIDUAL.id,
        notation: INDIVIDUAL.notation
      }
      currentAreaCatches.push(areaCatch);
      console.table(currentAreaCatches);

    }
    setPlayerAvailableCells();
    document.getElementById('buttonsArea').innerHTML = `<button class="continue-button" onclick="continueFishing()">Continuer</button>`;
  }, 3500);
}

/* ========================================================================= */
/* ======================= Interactions utilisateur ======================== */
/* ========================================================================= */


/* =============================== Home page =============================== */

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
            <img src="./medias/images/areas/france/france-fix.webp" />
            <span>france</span>
          </button>
          <button class="area-button" onclick="onAreaButtonClick(1)" disabled>
          <img src="./medias/images/areas/amazonie/amazonie-fix.webp" />
            <span>amazonie</span>
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

const onSettingsClick = () => {
  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup home-screen">
      <div class="popup-top">
        <span>Paramètres</span>
        <button class="close-popup-button" onclick="onClosePopupClick()">X</button>
      </div>
      <div class="settings-display">
        ${renderSettings()}
      </div>
    </div>
  `;
}
window.onSettingsClick = onSettingsClick;

const onAreaButtonClick = (areaIndex) => {
  currentArea = AREAS[areaIndex];
  fromHomeToArea(AREAS[areaIndex]);
}
window.onAreaButtonClick = onAreaButtonClick;

const onRecordsClick = () => {
  let user = getUser();
  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup home-screen">
      <div class="popup-top">
        <span>Records</span>
        <button class="close-popup-button" onclick="onClosePopupClick()">X</button>
      </div>
      <div class="records-display">

        <span>Prises totales : ${user.catches.length}</span>

        <span>Liste des meilleures prises</span>

        <div>
          <span>à venir</span>
        </div>

      </div>
    </div>
  `;
}
window.onRecordsClick = onRecordsClick;

const onCabinClick = () => {
  console.log('click cabin');
  fromHomeToArea();
}
window.onCabinClick = onCabinClick;

const onClosePopupClick = (popupName) => {
  document.getElementById('popup').remove();

  if (popupName == 'home' || popupName == 'vivier') {
    document.getElementById('vivierButton').removeAttribute('disabled');
    document.getElementById('homeButton').removeAttribute('disabled');
  }
}
window.onClosePopupClick = onClosePopupClick;

/* =============================== Area page =============================== */

// Top part -----------------------------------------
const onHomeClick = (isFromCabin) => {

  if (isFromCabin == true) {
    leaveArea();
  } else {
    let previousPopup = document.getElementById('popup');
    if (previousPopup != null) {
      previousPopup.remove();
    }
  
    document.getElementById('vivierButton').setAttribute('disabled', true);
    document.getElementById('homeButton').setAttribute('disabled', true);
  
    document.getElementById('main').innerHTML += `
      <div id="popup" class="popup goto-home">
        <div class="popup-top">
          <span>Retour à l'accueil</span>
          <button class="close-popup-button" onclick="onClosePopupClick('home')">X</button>
        </div>
        <div>
          <span>Voulez-vous vraiment retourner à l'accueil ?</span>
          <div>
            <button onclick="onClosePopupClick('home')">non</button>
            <button onclick="leaveArea()">oui</button>
          </div>
        </div>
      </div>
    `;
    setTouchEventCross();
  }
}
window.onHomeClick = onHomeClick;

const leaveArea = () => {
  isSelected = false;
  AREA_FISHES.forEach(fish => {
    clearInterval(fish.intervalId);
  });
  clearInterval(fishGeneration);
  AREA_FISHES = [];
  currentAreaCatches = [];
  fromAreaToHome();
}
window.leaveArea = leaveArea;

const onVivierClick = () => {
  //console.table(currentArea.fishes);
  document.getElementById('vivierButton').setAttribute('disabled', true);
  document.getElementById('main').innerHTML += `
    <div id="popup" class="popup vivier">
      <div class="popup-top">
        <span>Vivier</span>
        <button class="close-popup-button" onclick="onClosePopupClick('vivier')">X</button>
      </div>
      ${renderAreaVivier()}
    </div>
  `;
  if (document.getElementById('crossLeft') != null) {
    setTouchEventCross();
  }
}
window.onVivierClick = onVivierClick;

// Screen -------------------------------------------
const movePlayer = (direction) => {
  if (!isPlayerMoving) {
    isPlayerMoving = true;
    const PLAYER = document.getElementById('player');
    clearPlayerAvailableCells();
    if (direction == 'left') {
      PLAYER.style.backgroundImage = `url(${currentCharacter.leftMoving})`;
      setTimeout(() => {
        PLAYER.style.backgroundImage = `url(${currentCharacter.left})`;
      }, 200);
      if (currentPlayerColumn != 1) {
        let nextCell = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {
          currentPlayerColumn -= 1;
          PLAYER.style.left = `calc(${currentPlayerColumn - 1} * var(--cell-size))`;
        }
      }
    } else if (direction == 'up') {
      if (isOnRightFoot) {
        isOnRightFoot = false;
        PLAYER.style.backgroundImage = `url(${currentCharacter.backLeftFoot})`;
      } else {
        isOnRightFoot = true;
        PLAYER.style.backgroundImage = `url(${currentCharacter.backRightFoot})`;
      }
      setTimeout(() => {
        PLAYER.style.backgroundImage = `url(${currentCharacter.back})`;
      }, 200);
      if (currentPlayerLineLetterIndex != 0) {
        // calcul prochaine cellule
        let nextCell = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {
          currentPlayerLineLetterIndex -= 1;
          PLAYER.style.top = `calc(${currentPlayerLineLetterIndex} * var(--cell-size))`;
        }
      }
    } else if (direction == 'right') {
      PLAYER.style.backgroundImage = `url(${currentCharacter.rightMoving})`;
      setTimeout(() => {
        PLAYER.style.backgroundImage = `url(${currentCharacter.right})`;
      }, 200);
      if (currentPlayerColumn != 16) {
        let nextCell = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}`;
        if (document.getElementById(nextCell).classList.contains('walkable')) {    
          currentPlayerColumn += 1;
          PLAYER.style.left = `calc(${currentPlayerColumn - 1} * var(--cell-size))`;
        }
      }
    } else if (direction == 'down') {
      if (isOnRightFoot) {
        isOnRightFoot = false;
        PLAYER.style.backgroundImage = `url(${currentCharacter.frontLeftFoot})`;
      } else {
        isOnRightFoot = true;
        PLAYER.style.backgroundImage = `url(${currentCharacter.frontRightFoot})`;
      }
      setTimeout(() => {
        PLAYER.style.backgroundImage = `url(${currentCharacter.front})`;
      }, 200);
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
  const CELL = document.getElementById(cellId);

  if (!isSelected) {
    if (CELL.classList.contains('selectable')) {
      CELL.classList.replace('selectable', 'selected');
      isSelected = true;

      applyCharacterImgFromSelectedCell(cellId);

      document.getElementById('buttonsArea').innerHTML = '';
      document.getElementById('buttonsArea').innerHTML = `<button class="abort-button" onclick="abortFishing('${cellId}')">ANNULER</button>`;
    }
  } else {
    if (CELL.classList.contains('selected')) {
      abortFishing(cellId);
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
      ${getCrossContainer()}
      ${getHistoryContainer()}`;
      setTouchEventCross();
    }
  }
}
window.abortFishing = abortFishing;

const continueFishing = () => {
  isSelected = false;
  document.getElementById('buttonsArea').innerHTML = '';
  document.getElementById('buttonsArea').innerHTML = `
  ${getCrossContainer()}
  ${getHistoryContainer()}`;
  setTouchEventCross();
  document.getElementById('popup').remove();
  document.getElementById('vivierButton').removeAttribute('disabled');
}
window.continueFishing = continueFishing;

/* ========================================================================= */
/* =============================== SETTINGS ================================ */
/* ========================================================================= */

const renderSettingsGroup = (settingsGroup) => {
  let str = `
  <div id="settingsGroup${settingsGroup.id}" class="settings-group">
      <span class="settings-group-name">${settingsGroup.name}</span>`;

  settingsGroup.settings.forEach(setting => {
      str += `
      <div class="setting-tile">
          <div class="setting-label-area">
              <span class="setting-label">${setting.name}</span>
          </div>
          <div class="setting-switch-area">
              <label class="switch" for="${setting.id}">
                  <input id="${setting.id}" type="checkbox"
                      onclick="handleCheck('${setting.id}')" ${setting.isActive ? "checked" : ""} />
                  <span class="slider round"></span>
              </label>
          </div>    
      </div>`;
  });
  str += `</div>`;
  return str;
}
const renderSettings = () => {
  let user = getUser();
  let str = '';
  user.settings.forEach(settingsGroup => {
    str += renderSettingsGroup(settingsGroup);
  });
  return str;
}

const handleCheck = (id) => {
  let user = getUser();

  user.settings.forEach(settingsGroups => {
      settingsGroups.settings.forEach(setting => {
          if (`${setting.id}`== id) {
              setting.isActive = document.getElementById(id).checked;
              if (setting.id == 'keepScreenAwake') {
                setTimeout(() => {
                  window.location = window.location;
                }, 300); 
              }
              /* if (setting.id == 'music') {
                  if (setting.isActive) {
                      if (music.duration > 0 && !music.paused) {
                          console.log('Music is aldrady playing');
                      } else {
                          music.play();
                      }
                  } else {
                      if (music.duration > 0 && !music.paused) {
                          music.pause();
                      }
                  }
              } */
          }
      });
  });

  setUser(user);
};
window.handleCheck = handleCheck;

/* ========================================================================= */
/* =============================== EXECUTION =============================== */
/* ========================================================================= */

setStorage();
if (getUserSetting('keepScreenAwake').isActive) { await requestWakeLock(); }

const USER = getUser();

let currentArea = AREAS[0];
let currentAreaCatches = [];
let currentRod = USER.currentRod;

let isSelected = false;
let fishGeneration = '';

let currentCharacterId = CHARACTERS[USER.currentCharacter];
let currentPlayerLineLetterIndex = currentArea.spawnLine - 1;
let currentPlayerColumn = currentArea.spawnColumn;

let isPlayerMoving = false;
let currentCharacter = getCurrentPlayerSprites();
let isOnRightFoot = true;

let fishes = 0;
let AREA_FISHES = [];
const fishImages = {
  front: `./medias/images/characters/fish-front.webp`,
  back: `./medias/images/characters/fish-back.webp`,
  left: `./medias/images/characters/fish-left.webp`,
  right: `./medias/images/characters/fish-right.webp`,
};

openAppCinematic(true);

// ------------------------------------------------------------------------------------

const hasFishAlreadyBeenCatched = (fishId) => {
  let hasBeenCatched = false;
  let user = getUser();
  
  user.catches.forEach(catchedFish => {
    if (catchedFish.fishId == fishId) {
      hasBeenCatched =  true;
    }
  });

  return hasBeenCatched;
}







