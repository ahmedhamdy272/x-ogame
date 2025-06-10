"use strict";

// Game configuration
const gameConfig = {
  human: "X",
  computer: "O",
  difficulty: localStorage.getItem("gameDifficulty") || "medium",
  humanWins: 0,
  computerWins: 0,
  draws: 0,
  turn: "X",
  playerName: localStorage.getItem("playerName") || "",
};

// DOM Elements
const welcomeScreen = document.getElementById("welcomeScreen");
const gameScreen = document.getElementById("gameScreen");
const playerNameInput = document.getElementById("playerName");
const playerNameDisplay = document.getElementById("playerNameDisplay");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const startGameButton = document.getElementById("startGame");
const restart = document.querySelector(".restart");
const difficultySelect = document.createElement("select");
const statsDisplay = document.createElement("div");
const resultOverlay = document.getElementById("resultOverlay");
const resultMessage = document.getElementById("resultMessage");

// Audio Elements
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");

// Initialize welcome screen
function initializeWelcomeScreen() {
  // Load saved player name if exists
  if (gameConfig.playerName) {
    playerNameInput.value = gameConfig.playerName;
    startGameButton.disabled = false;
  }

  // Set saved difficulty
  setDifficulty(gameConfig.difficulty);

  // Add event listeners for difficulty buttons
  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDifficulty(button.dataset.difficulty);
      playSound(clickSound);
    });
  });

  // Add event listener for start game button
  startGameButton.addEventListener("click", () => {
    playSound(clickSound);
    startGame();
  });

  // Enable/disable start button based on name input
  playerNameInput.addEventListener("input", () => {
    startGameButton.disabled = !playerNameInput.value.trim();
  });

  // Check if we should show welcome screen
  if (gameConfig.playerName) {
    // If we have saved preferences, start game directly
    startGame();
  } else {
    // Show welcome screen if no saved preferences
    welcomeScreen.style.display = "flex";
    gameScreen.style.display = "none";
  }
}

function setDifficulty(difficulty) {
  gameConfig.difficulty = difficulty;
  localStorage.setItem("gameDifficulty", difficulty);

  // Update button styles and ARIA attributes
  difficultyButtons.forEach((button) => {
    const isSelected = button.dataset.difficulty === difficulty;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-checked", isSelected);
  });
}

function startGame() {
  const playerName = playerNameInput.value.trim();
  if (!playerName) return;

  // Save player name
  gameConfig.playerName = playerName;
  localStorage.setItem("playerName", playerName);
  playerNameDisplay.textContent = playerName;

  // Display current difficulty
  document.getElementById("currentDifficulty").textContent =
    gameConfig.difficulty.charAt(0).toUpperCase() +
    gameConfig.difficulty.slice(1);

  // Hide welcome screen and show game screen
  welcomeScreen.style.display = "none";
  gameScreen.style.display = "flex";

  // Reset game state
  resetGame();

  // Initialize game settings
  initializeGameSettings();

  // Initialize restart button
  const restartButton = document.querySelector(".restart");
  restartButton.addEventListener("click", function () {
    playSound(clickSound);
    // Reset scores
    gameConfig.humanWins = 0;
    gameConfig.computerWins = 0;
    gameConfig.draws = 0;

    // Update score display
    document.getElementById("human").innerHTML = gameConfig.humanWins;
    document.getElementById("computer").innerHTML = gameConfig.computerWins;

    // Update stats display
    updateStats();

    // Reset game state
    resetGame();
  });
}

// Initialize game settings
function initializeGameSettings() {
  // Add difficulty selector
  difficultySelect.innerHTML = `
    <option value="easy">Easy</option>
    <option value="medium" selected>Medium</option>
    <option value="hard">Hard</option>
  `;
  document.querySelector(".game-settings").appendChild(difficultySelect);

  // Add player name input
  playerNameInput.type = "text";
  playerNameInput.placeholder = "Enter your name";
  document.querySelector(".game-settings").appendChild(playerNameInput);

  // Add stats display
  statsDisplay.className = "stats";
  document.querySelector(".game-settings").appendChild(statsDisplay);

  updateStats();
}

function updateStats() {
  statsDisplay.innerHTML = `
    <h3 class="animated-border">Game Statistics</h3>
    <div class="stat-item wins">
      <span class="stat-icon">🏆</span>
      <span>Wins</span>
      <span class="stat-value">${gameConfig.humanWins}</span>
    </div>
    <div class="stat-item losses">
      <span class="stat-icon">😢</span>
      <span>Losses</span>
      <span class="stat-value">${gameConfig.computerWins}</span>
    </div>
    <div class="stat-item draws">
      <span class="stat-icon">🤝</span>
      <span>Draws</span>
      <span class="stat-value">${gameConfig.draws}</span>
    </div>
  `;

  // Add celebration animation when stats change
  const statItems = statsDisplay.querySelectorAll(".stat-item");
  statItems.forEach((item) => {
    item.classList.add("celebrate");
    setTimeout(() => {
      item.classList.remove("celebrate");
    }, 500);
  });
}

function nextMove(button) {
  if (button.disabled) return; // Prevent clicking on already used cells

  playSound(clickSound);
  setMove(button);
  const gameResult = checkForWin();

  if (gameResult === 1) {
    gameConfig.humanWins++;
    showResult("You Win! 🎉", true);
    document.getElementById("human").innerHTML = gameConfig.humanWins;
    updateStats();
    resetGame();
    return;
  } else if (gameResult === 2) {
    gameConfig.computerWins++;
    showResult("Computer Wins! 😢", false);
    document.getElementById("computer").innerHTML = gameConfig.computerWins;
    updateStats();
    resetGame();
    return;
  } else if (gameResult === 3) {
    gameConfig.draws++;
    showResult("It's a Draw! 🤝", null);
    updateStats();
    resetGame();
    return;
  }

  switchTurn();
  computerTurn();

  const computerResult = checkForWin();
  if (computerResult === 1) {
    gameConfig.humanWins++;
    showResult("You Win! 🎉", true);
    document.getElementById("human").innerHTML = gameConfig.humanWins;
    updateStats();
    resetGame();
    return;
  } else if (computerResult === 2) {
    gameConfig.computerWins++;
    showResult("Computer Wins! 😢", false);
    document.getElementById("computer").innerHTML = gameConfig.computerWins;
    updateStats();
    resetGame();
    return;
  } else if (computerResult === 3) {
    gameConfig.draws++;
    showResult("It's a Draw! 🤝", null);
    updateStats();
    resetGame();
    return;
  }

  switchTurn();
}

function showResult(message, isWin) {
  resultMessage.textContent = message;
  resultOverlay.style.display = "flex";

  // Play appropriate sound
  if (isWin === true) {
    playSound(winSound);
  } else if (isWin === false) {
    playSound(winSound); // You could add a lose sound
  } else {
    playSound(drawSound);
  }

  // Hide result after 2 seconds
  setTimeout(() => {
    resultOverlay.style.display = "none";
  }, 2000);
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {
    // Handle autoplay restrictions
  });
}

function switchFirstTurn() {
  if (gameConfig.human === "X") {
    gameConfig.human = "O";
    gameConfig.computer = "X";
  } else {
    gameConfig.human = "X";
    gameConfig.computer = "O";
  }
}

function switchTurn() {
  gameConfig.turn =
    gameConfig.turn === gameConfig.human
      ? gameConfig.computer
      : gameConfig.human;
}

/**
 *
 * @param {Button} button
 * Smjesta onaj znak koji je igran u button i radi disable tog buttona da se na njega ne bi moglo ponovo kliknuti
 */
function setMove(button) {
  button.value = gameConfig.turn;
  button.innerHTML = gameConfig.turn;
  button.disabled = true;
}

function computerTurn() {
  const panel = document.getElementById("panel").getElementsByTagName("button");

  // Different strategies based on difficulty
  switch (gameConfig.difficulty) {
    case "easy":
      makeRandomMove(panel);
      break;
    case "medium":
      if (Math.random() < 0.5) {
        if (!makeStrategicMove(panel)) {
          makeRandomMove(panel);
        }
      } else {
        makeRandomMove(panel);
      }
      break;
    case "hard":
      if (!makeStrategicMove(panel)) {
        makeRandomMove(panel);
      }
      break;
  }
}

function makeStrategicMove(panel) {
  // Try to win
  for (let i = 0; i < panel.length; i++) {
    if (panel[i].value === "") {
      panel[i].value = gameConfig.computer;
      if (checkForWin() === 2) {
        setMove(panel[i]);
        return true;
      }
      panel[i].value = "";
    }
  }

  // Block player's winning move
  for (let i = 0; i < panel.length; i++) {
    if (panel[i].value === "") {
      panel[i].value = gameConfig.human;
      if (checkForWin() === 1) {
        panel[i].value = gameConfig.computer;
        setMove(panel[i]);
        return true;
      }
      panel[i].value = "";
    }
  }

  return false;
}

function makeRandomMove(panel) {
  const emptyCells = Array.from(panel).filter((cell) => cell.value === "");
  if (emptyCells.length > 0) {
    const randomCell =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    setMove(randomCell);
  }
}

/**
 *  Vraca 0 ako igra je jos uvijek u tijeku tj. nije zavrsena
 *  Vraca 1 ako je kraj igre i pobjednik je Igrac 1
 *  Vraca 2 ako je kraj igre i pobjednik je Igrac 2 (u nasem slucaju computer posto se ne moze multiplayer)
 *  Vraca 3 ako je kraj igre a rezultat je nerjesen
 */
function checkForWin() {
  let panel = document.getElementById("panel").getElementsByTagName("button");
  let matrix = [];
  let counter = 0;
  let winner = 3;
  for (let i = 0; i < 3; i++) {
    matrix[i] = [];
    for (let j = 0; j < 3; j++) {
      matrix[i][j] = panel[counter++].value;
      if (matrix[i][j] == "") winner = 0;
    }
  }
  for (let i = 0; i < 3; i++) {
    if (
      (matrix[i][0] == gameConfig.human &&
        matrix[i][1] == gameConfig.human &&
        matrix[i][2] == gameConfig.human) ||
      (matrix[0][i] == gameConfig.human &&
        matrix[1][i] == gameConfig.human &&
        matrix[2][i] == gameConfig.human)
    ) {
      winner = 1;
    }
    if (
      (matrix[i][0] == gameConfig.computer &&
        matrix[i][1] == gameConfig.computer &&
        matrix[i][2] == gameConfig.computer) ||
      (matrix[0][i] == gameConfig.computer &&
        matrix[1][i] == gameConfig.computer &&
        matrix[2][i] == gameConfig.computer)
    ) {
      winner = 2;
    }
  }
  if (
    (matrix[0][0] == gameConfig.human &&
      matrix[1][1] == gameConfig.human &&
      matrix[2][2] == gameConfig.human) ||
    (matrix[0][2] == gameConfig.human &&
      matrix[1][1] == gameConfig.human &&
      matrix[2][0] == gameConfig.human)
  )
    winner = 1;
  if (
    (matrix[0][0] == gameConfig.computer &&
      matrix[1][1] == gameConfig.computer &&
      matrix[2][2] == gameConfig.computer) ||
    (matrix[0][2] == gameConfig.computer &&
      matrix[1][1] == gameConfig.computer &&
      matrix[2][0] == gameConfig.computer)
  )
    winner = 2;

  return winner;
}

function resetGame() {
  // Reset the game board
  const buttons = document
    .getElementById("panel")
    .getElementsByTagName("button");
  for (let button of buttons) {
    button.disabled = false;
    button.value = "";
    button.innerHTML = "";
    button.style.backgroundColor = ""; // Reset any background color
  }

  // Reset game configuration
  gameConfig.human = "X";
  gameConfig.computer = "O";
  gameConfig.turn = "X";

  // Update turn display
  document.querySelector(".vs").textContent = "VS";

  // If computer goes first, make its move
  if (gameConfig.computer === "X") {
    setTimeout(() => {
      computerTurn();
      switchTurn();
    }, 500);
  }
}

// Add a function to clear saved preferences
function clearPreferences() {
  playSound(clickSound);
  localStorage.removeItem("playerName");
  localStorage.removeItem("gameDifficulty");
  location.reload();
}

// Initialize welcome screen when page loads
initializeWelcomeScreen();
resetGame();
