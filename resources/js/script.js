"use strict";

//Define variables
const infiniteRolls = false; //For testing only
let multiplayer = true;
let currentPlayer = "player1";
const diceNumbers = [0, 0, 0, 0, 0];
const diceLocked = [false, false, false, false, false];
const possibleScores = new Array(14).fill(0);
const playerScores = {
  player1: new Array(14),
  player2: new Array(14),
};
let playerScoreTotals = {
  player1: 0,
  player2: 0,
};
let rollsLeft = 3;
let ScoreAvailable = false;
let diceLockable = true;

const scoreCardRows = document.querySelectorAll(".score-card__row");
const playerScoreCards = {
  player1: [],
  player2: [],
};
for (let i = 0; i < possibleScores.length; i++) {
  playerScoreCards.player1[i] =
    document.querySelector(".score-card").children[i + 1].children[1];
  playerScoreCards.player2[i] =
    document.querySelector(".score-card").children[i + 1].children[2];
}
const playerScoreCardsOpen = {
  player1: new Array(14).fill(true),
  player2: new Array(14).fill(true),
};
playerScoreCardsOpen.player1[6] = false;
playerScoreCardsOpen.player2[6] = false;
const playerNames = {
  player1: document.querySelector("#score-card__row-players").children[1],
  player2: document.querySelector("#score-card__row-players").children[2],
};
const playerScoreTotalCells = {
  player1: document.querySelector("#score-card__cell-total-1"),
  player2: document.querySelector("#score-card__cell-total-2"),
};
const yahtzeeLogo = document.querySelector("#yahtzee-logo");
const diceArea = document.querySelector(".game-area__dice-area");
const dice = document.querySelectorAll(".die");
const rollButton = document.querySelector(".game-area__button-roll");
const nextButton = document.querySelector(".game-area__button-next");
const gameSelector = document.querySelector(".game-selector");
const singleplayerButton = document.querySelector(
  ".game-selector__modal-button-single"
);
const multiplayerButton = document.querySelector(
  ".game-selector__modal-button-multi"
);
const gameOver = document.querySelector(".game-over");
const gameOverPlayer1Score = document.querySelector(
  "#game-over__modal__player-1"
);
const gameOverPlayer2Score = document.querySelector(
  "#game-over__modal__player-2"
);
const gameOverWinner = document.querySelector("#game-over__modal__winner");
const playAgainButton = document.querySelector(".play-again-button");

//Choose gamemode
singleplayerButton.addEventListener("click", function () {
  multiplayer = false;
  gameSelector.classList.add("hidden");
  //Hide player 2 score card
  playerNames.player2.style.display = "none";
  for (let i = 0; i < playerScoreCards.player2.length; i++) {
    playerScoreCards.player2[i].style.display = "none";
  }
  playerScoreTotalCells.player2.style.display = "none";
  scoreCardRows.forEach(function (element) {
    element.style.gridTemplateColumns = "2fr 1fr";
  });
});
multiplayerButton.addEventListener("click", function () {
  multiplayer = true;
  gameSelector.classList.add("hidden");
  //Show player 2 score card
  playerNames.player2.style.display = "flex";
  for (let i = 0; i < playerScoreCards.player2.length; i++) {
    playerScoreCards.player2[i].style.display = "flex";
  }
  playerScoreTotalCells.player2.style.display = "flex";
  scoreCardRows.forEach(function (element) {
    element.style.gridTemplateColumns = "2fr repeat(2, 1fr)";
  });
});

//Roll dice
rollButton.addEventListener("click", function () {
  //Disable roll button
  rollButton.disabled = true;
  rollsLeft--;
  if (infiniteRolls) rollsLeft = 3;
  rollButton.textContent = `Roll dice (${rollsLeft})`;
  //Take away ability to set score or lock dice
  ScoreAvailable = false;
  diceLockable = false;
  for (let i = 0; i < playerScoreCards[currentPlayer].length; i++) {
    playerScoreCards[currentPlayer][i].classList.remove("clickable-cell");
  }
  //Die animation
  const diceAreaHeight = diceArea.clientHeight - 75;
  for (let i = 0; i < dice.length; i++) {
    if (!diceLocked[i]) {
      dice[i].style.transform = "none";
      const randomY = Math.trunc(Math.random() * diceAreaHeight + 400);
      const randomRot = Math.trunc(Math.random() * 720 - 360);
      setTimeout(() => {
        randomiseDie(i);
        dice[
          i
        ].style.transform = `translateY(${randomY}px) rotate(${randomRot}deg)`;
      }, 500);
    }
  }
  //Get ready to set score or roll again
  setTimeout(() => {
    if (rollsLeft > 0) rollButton.disabled = false;
    checkScores();
    ScoreAvailable = true;
    diceLockable = true;
    for (let i = 0; i < playerScoreCards[currentPlayer].length; i++) {
      if (playerScoreCardsOpen[currentPlayer][i]) {
        playerScoreCards[currentPlayer][i].classList.add("clickable-cell");
      }
    }
  }, 1000);
});

function randomiseDie(i) {
  diceNumbers[i] = Math.trunc(Math.random() * 6 + 1);
  dice[i].src = `resources/img/die-${diceNumbers[i]}.png`;
}

function checkScores() {
  for (let i = 0; i < possibleScores.length; i++) {
    possibleScores[i] = 0;
  }
  //0 = ones
  possibleScores[0] = diceNumbers.filter((number) => number === 1).length;
  //1 - twos
  possibleScores[1] = diceNumbers.filter((number) => number === 2).length * 2;
  //2 - threes
  possibleScores[2] = diceNumbers.filter((number) => number === 3).length * 3;
  //3 - fours
  possibleScores[3] = diceNumbers.filter((number) => number === 4).length * 4;
  //4 - fives
  possibleScores[4] = diceNumbers.filter((number) => number === 5).length * 5;
  //5 - sixes
  possibleScores[5] = diceNumbers.filter((number) => number === 6).length * 6;
  //7 - three of a kind
  if (checkForMultiples(3)) {
    possibleScores[7] = diceNumbers.reduce(
      (accumulator, number) => accumulator + number,
      0
    );
  }
  //8 - four of a kind
  if (checkForMultiples(4)) {
    possibleScores[8] = diceNumbers.reduce(
      (accumulator, number) => accumulator + number,
      0
    );
  }
  //9 - full house
  if (checkForFullHouse()) {
    possibleScores[9] = 25;
  }
  //10 - small straight
  if (checkForStraight(4)) {
    possibleScores[10] = 30;
  }
  //11 - large straight
  if (checkForStraight(5)) {
    possibleScores[11] = 40;
  }
  //12 - chance
  let diceTotal = 0;
  for (let i = 0; i < diceNumbers.length; i++) {
    diceTotal += diceNumbers[i];
  }
  possibleScores[12] = diceTotal;
  //13 - yahtzee
  if (checkForMultiples(5)) {
    if (playerScores[currentPlayer][13] >= 50) {
      playerScoreCardsOpen[currentPlayer][13] = true;
      possibleScores[13] = playerScores[currentPlayer][13] + 100;
    } else {
      possibleScores[13] = 50;
    }
    //Play yahtzee animation
    const distance = diceArea.offsetHeight;
    yahtzeeLogo.style.transform = `translate(-50%, -50%) translateY(${
      distance * 3.5
    }px)`;
    console.log(distance);
    setTimeout(() => {
      yahtzeeLogo.style.transform = `translate(-50%, -50%)`;
    }, 3000);
  }
  //Show possible scores
  for (let i = 0; i < possibleScores.length; i++) {
    if (playerScoreCardsOpen[currentPlayer][i]) {
      playerScoreCards[currentPlayer][i].textContent = possibleScores[i];
    }
  }
}

function checkForMultiples(multiplesNeeded) {
  const counter = getArrayOfCounters();
  for (let i = 0; i < counter.length; i++) {
    if (counter[i] >= multiplesNeeded) return true;
  }
  return false;
}

function checkForFullHouse() {
  const counter = getArrayOfCounters();
  let two = false;
  let three = false;
  let five = false;
  for (let i = 0; i < counter.length; i++) {
    if (counter[i] === 2) two = true;
    if (counter[i] === 3) three = true;
    if (counter[i] === 5) five = true;
  }
  if ((two && three) || five) {
    return true;
  } else {
    return false;
  }
}

function getArrayOfCounters() {
  const counter = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < diceNumbers.length; i++) {
    const currentNumber = diceNumbers[i] - 1;
    counter[currentNumber]++;
  }
  return counter;
}

function checkForStraight(straightLengthNeeded) {
  let uniqueArray = [...new Set(diceNumbers)];
  uniqueArray.sort((a, b) => a - b);
  for (let i = 0; i < diceNumbers.length - (straightLengthNeeded - 1); i++) {
    let straight = true;
    for (let j = 1; j < straightLengthNeeded; j++) {
      if (uniqueArray[i + j] !== uniqueArray[i] + j) {
        straight = false;
        break;
      }
    }
    if (straight) return true;
  }
  return false;
}

//Lock die
for (let i = 0; i < dice.length; i++) {
  dice[i].addEventListener("click", function () {
    if (diceLockable) {
      if (diceLocked[i]) {
        diceLocked[i] = !diceLocked[i];
        dice[i].style.boxShadow = "none";
      } else {
        diceLocked[i] = !diceLocked[i];
        dice[i].style.boxShadow = "0 0 0 5px red";
      }
    }
  });
}

//Set score
for (let i = 0; i < playerScoreCards.player1.length; i++) {
  playerScoreCards.player1[i].addEventListener("click", function () {
    if (currentPlayer === "player1") setScore(i);
  });
  playerScoreCards.player2[i].addEventListener("click", function () {
    if (currentPlayer === "player2") setScore(i);
  });
}

function setScore(i) {
  if (ScoreAvailable && playerScoreCardsOpen[currentPlayer][i]) {
    //Disable roll button
    rollButton.disabled = true;
    rollsLeft = 0;
    rollButton.textContent = `Roll dice (${rollsLeft})`;
    //Take away ability to set score or lock dice
    ScoreAvailable = false;
    diceLockable = false;
    for (let j = 0; j < playerScoreCards[currentPlayer].length; j++) {
      playerScoreCards[currentPlayer][j].classList.remove("clickable-cell");
      if (playerScoreCardsOpen[currentPlayer][j]) {
        playerScoreCards[currentPlayer][j].textContent = 0;
      }
    }
    //Set score in selected cell
    playerScoreCardsOpen[currentPlayer][i] = false;
    playerScores[currentPlayer][i] = possibleScores[i];
    playerScoreCards[currentPlayer][i].textContent =
      playerScores[currentPlayer][i];
    playerScoreCards[currentPlayer][i].classList.add("clicked-cell");
    //Update bonus score
    let onesToSixes = 0;
    for (let j = 0; j < 6; j++) {
      if (playerScores[currentPlayer][j] != undefined)
        onesToSixes += playerScores[currentPlayer][j];
    }
    if (onesToSixes >= 63) {
      playerScores[currentPlayer][6] = 35;
    } else {
      playerScores[currentPlayer][6] = 0;
    }
    playerScoreCards[currentPlayer][6].textContent =
      playerScores[currentPlayer][6];
    //Update total score
    let scoreTotal = 0;
    for (let j = 0; j < playerScores[currentPlayer].length; j++) {
      if (playerScores[currentPlayer][j] !== undefined)
        scoreTotal += playerScores[currentPlayer][j];
    }
    playerScoreTotals[currentPlayer] = scoreTotal;
    playerScoreTotalCells[currentPlayer].textContent =
      playerScoreTotals[currentPlayer];
    //If there's turns left, enable next button
    if (!multiplayer) {
      if (playerScores.player1.includes(undefined)) {
        nextButton.disabled = false;
      } else {
        finishGame();
      }
    } else {
      if (
        playerScores.player1.includes(undefined) ||
        playerScores.player2.includes(undefined)
      ) {
        nextButton.disabled = false;
      } else {
        finishGame();
      }
    }
  }
}

function finishGame() {
  gameOver.classList.remove("hidden");
  if (!multiplayer) {
    gameOverPlayer1Score.textContent = `You finished with a score of ${playerScoreTotals.player1}.`;
  } else {
    gameOverPlayer1Score.textContent = `Player 1 finished with a score of ${playerScoreTotals.player1}.`;
    gameOverPlayer2Score.textContent = `Player 2 finished with a score of ${playerScoreTotals.player2}.`;
    if (playerScoreTotals.player1 === playerScoreTotals.player2) {
      gameOverWinner.textContent = "It's a tie!";
    } else {
      gameOverWinner.textContent = `${
        playerScoreTotals.player1 > playerScoreTotals.player2
          ? "Player 1"
          : "Player 2"
      } won!`;
    }
  }
}

//Next turn
nextButton.addEventListener("click", function () {
  //Disable next button
  nextButton.disabled = true;
  //Switch player turns if multiplayer
  if (multiplayer) {
    if (
      currentPlayer === "player1" &&
      playerScores.player2.includes(undefined)
    ) {
      currentPlayer = "player2";
      playerNames.player1.classList.remove("player-turn");
      playerNames.player2.classList.add("player-turn");
    } else if (
      currentPlayer === "player2" &&
      playerScores.player1.includes(undefined)
    ) {
      currentPlayer = "player1";
      playerNames.player1.classList.add("player-turn");
      playerNames.player2.classList.remove("player-turn");
    }
  }
  //Enable roll button
  rollButton.disabled = false;
  rollsLeft = 3;
  rollButton.textContent = `Roll dice (${rollsLeft})`;
  //Reset dice
  for (let i = 0; i < diceNumbers.length; i++) {
    dice[i].style.transform = "none";
    diceLocked[i] = false;
    dice[i].style.boxShadow = "none";
  }
});

//Reset game
playAgainButton.addEventListener("click", function () {
  gameOver.classList.add("hidden");
  gameSelector.classList.remove("hidden");
  for (let i = 0; i < dice.length; i++) {
    dice[i].style.transform = "none";
    setTimeout(() => {
      diceLocked[i] = false;
    }, 500);
  }
  rollButton.disabled = false;
  rollsLeft = 3;
  rollButton.textContent = `Roll dice (${rollsLeft})`;
  currentPlayer = "player1";
  playerScores.player1 = new Array(14);
  playerScores.player2 = new Array(14);
  for (let i = 0; i < playerScoreCards.player1.length; i++) {
    playerScoreCards.player1[i].textContent = "0";
    playerScoreCards.player2[i].textContent = "0";
    playerScoreCards.player1[i].classList.remove("clicked-cell");
    playerScoreCards.player2[i].classList.remove("clicked-cell");
    playerScoreCardsOpen.player1[i] = true;
    playerScoreCardsOpen.player2[i] = true;
  }
  playerScoreCardsOpen.player1[6] = false;
  playerScoreCardsOpen.player2[6] = false;
  playerScoreTotals.player1 = 0;
  playerScoreTotals.player2 = 0;
  playerScoreTotalCells.player1.textContent = "0";
  playerScoreTotalCells.player2.textContent = "0";
  for (let i = 0; i < dice.length; i++) {
    dice[i].style.boxShadow = "0 0 0 5px red";
  }
  playerNames.player1.classList.add("player-turn");
  playerNames.player2.classList.remove("player-turn");
});
