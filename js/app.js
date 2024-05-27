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

const minSpawnTime = 7134;
const maxSpawnTime = 14798;
const spawnRepetitions = 1000;

const minFishMovement = 16;
const maxFishMovement = 64;

/* ========================================================================= */
/* ============================ Génération DOM ============================= */
/* ========================================================================= */

/* ############################### Home page ############################### */

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
  generateFishRandomlyXTimes(randomIntFromInterval(minSpawnTime, maxSpawnTime), spawnRepetitions);
}

/* ############################### Area page ############################### */

/* ================================ Top part ================================ */
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
    }, 200);
  });

  crossLeft.addEventListener('touchend', (event) => {
    event.preventDefault();
    clearInterval(leftTouchEventIntervalId);
    stillNeedToMove = false;
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
    }, 200);
  });

  crossUp.addEventListener('touchend', (event) => {
    event.preventDefault();
    clearInterval(upTouchEventIntervalId);
    stillNeedToMove = false;
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
    }, 200);
  });

  crossRight.addEventListener('touchend', (event) => {
    event.preventDefault();
    clearInterval(rightTouchEventIntervalId);
    stillNeedToMove = false;
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
    }, 200);
  });

  crossDown.addEventListener('touchend', (event) => {
    event.preventDefault();
    clearInterval(downTouchEventIntervalId);
    stillNeedToMove = false;
    crossDown.classList.remove('pressed');
  });
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
        <button id="crossLeft" class="cross-button left" onclick="movePlayer('left')"></button>
        <button id="crossUp" class="cross-button up" onclick="movePlayer('up')"></button>
        <button id="crossRight" class="cross-button right" onclick="movePlayer('right')"></button>
        <button id="crossDown" class="cross-button down" onclick="movePlayer('down')"></button>
      </div>
    </div>
  `;
  setTouchEventCross();
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
  // Canne à pêche 1

  let leftCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn - 1}`;
  let upCellId = `${letters[currentPlayerLineLetterIndex - 1]}${currentPlayerColumn}`;
  let rightCellId = `${letters[currentPlayerLineLetterIndex]}${currentPlayerColumn + 1}`;
  let downCellId = `${letters[currentPlayerLineLetterIndex + 1]}${currentPlayerColumn}`;

  setPlayerAvailableCell(document.getElementById(leftCellId));
  setPlayerAvailableCell(document.getElementById(upCellId));
  setPlayerAvailableCell(document.getElementById(rightCellId));
  setPlayerAvailableCell(document.getElementById(downCellId));

  if (currentRod != 'canne1') {
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

  if (currentRod != 'canne1') {
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
  moveFishRandomlyXTimes(AREA_FISHES[AREA_FISHES.length - 1], 1000, randomIntFromInterval(minFishMovement, maxFishMovement));
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

/* =============================== Area page =============================== */

// Top part -----------------------------------------
const onHomeClick = () => {
  isSelected = false;
  AREA_FISHES.forEach(fish => {
    clearInterval(fish.intervalId);
  });
  clearInterval(fishGeneration);
  renderHomeTemplate();
  AREA_FISHES = [];
}
window.onHomeClick = onHomeClick;

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

// Screen -------------------------------------------
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
  const CELL = document.getElementById(cellId);

  if (!isSelected) {
    if (CELL.classList.contains('selectable')) {
      CELL.classList.replace('selectable', 'selected');
      isSelected = true;
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
      <div class="cross-container">
        <button id="crossLeft" class="cross-button left" onclick="movePlayer('left')"><img class="button-caret" src="./medias/images/icons/caret-left-grey.png"/></button>
        <button id="crossUp" class="cross-button up" onclick="movePlayer('up')"></button>
        <button id="crossRight" class="cross-button right" onclick="movePlayer('right')"></button>
        <button id="crossDown" class="cross-button down" onclick="movePlayer('down')"></button>
      </div>`;
      setTouchEventCross();
    }
  }
}
window.abortFishing = abortFishing;

const continueFishing = () => {
  isSelected = false;
  document.getElementById('buttonsArea').innerHTML = '';
  document.getElementById('buttonsArea').innerHTML = `
  <div class="cross-container">
    <button id="crossLeft" class="cross-button left" onclick="movePlayer('left')"><img class="button-caret" src="./medias/images/icons/caret-left-grey.png"/></button>
    <button id="crossUp" class="cross-button up" onclick="movePlayer('up')"></button>
    <button id="crossRight" class="cross-button right" onclick="movePlayer('right')"></button>
    <button id="crossDown" class="cross-button down" onclick="movePlayer('down')"></button>
  </div>`;
  setTouchEventCross();
  document.getElementById('popup').remove();
}
window.continueFishing = continueFishing;

/* ========================================================================= */
/* =============================== EXECUTION =============================== */
/* ========================================================================= */















await requestWakeLock();
//
renderHomeTemplate();




let currentArea = AREAS[0];
let currentRod = 'canne1';

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











