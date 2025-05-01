document.addEventListener('DOMContentLoaded', () => {
    const board = document.querySelector('.game-board');
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('#status');
    const resetButton = document.querySelector('#reset-btn');
    
    // Sound effects
    const sounds = {
        placeX: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
        placeO: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'),
        win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
        draw: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3'),
        click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
        computer: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-robot-digital-alarm-389.mp3')
    };

    // Preload sounds
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.3;
        sound.load();
    });

    let gameActive = true;
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize game
    function initializeGame() {
        sounds.click.play();
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.textContent = `Your turn (${currentPlayer})`;
        
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'winning-cell');
            cell.textContent = "";
        });
    }
    
    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== "" || !gameActive) return;
        
        // Play human move with sound
        if (currentPlayer === "X") {
            sounds.placeX.currentTime = 0;
            sounds.placeX.play();
        } else {
            sounds.placeO.currentTime = 0;
            sounds.placeO.play();
        }
        
        playMove(clickedCell, clickedCellIndex, currentPlayer);
        
        if (gameActive) {
            // Computer's turn
            currentPlayer = "O";
            statusDisplay.textContent = "Computer thinking...";
            
            setTimeout(() => {
                sounds.computer.play();
                computerMove();
            }, 800);
        }
    }
    
    // Play a move
    function playMove(cell, index, player) {
        gameState[index] = player;
        cell.classList.add(player.toLowerCase());
        
        const roundWon = checkWin();
        const roundDraw = checkDraw();
        
        if (roundWon) {
            sounds.win.play();
            announceWinner(roundWon);
            return;
        }
        
        if (roundDraw) {
            sounds.draw.play();
            announceDraw();
            return;
        }
        
        if (player === "X") {
            statusDisplay.textContent = `Your turn (${currentPlayer})`;
        }
    }
    
    // Computer move logic
    function computerMove() {
        if (!gameActive) return;
        
        // Simple AI: Try to win, then block, then random
        let move = findWinningMove("O") || 
                  findWinningMove("X") || 
                  findRandomMove();
        
        if (move !== null) {
            const cell = cells[move];
            sounds.placeO.currentTime = 0;
            sounds.placeO.play();
            playMove(cell, move, "O");
            currentPlayer = "X";
        }
    }
    
    // Find winning move
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] === player && gameState[b] === player && gameState[c] === "") {
                return c;
            }
            if (gameState[a] === player && gameState[c] === player && gameState[b] === "") {
                return b;
            }
            if (gameState[b] === player && gameState[c] === player && gameState[a] === "") {
                return a;
            }
        }
        return null;
    }
    
    // Find random move
    function findRandomMove() {
        const availableMoves = gameState
            .map((val, idx) => val === "" ? idx : null)
            .filter(val => val !== null);
        
        if (availableMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            return availableMoves[randomIndex];
        }
        return null;
    }
    
    // Check for win
    function checkWin() {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "") {
                continue;
            }
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                // Highlight winning cells
                cells[a].classList.add('winning-cell');
                cells[b].classList.add('winning-cell');
                cells[c].classList.add('winning-cell');
                
                return gameState[a];
            }
        }
        return null;
    }
    
    // Check for draw
    function checkDraw() {
        return !gameState.includes("");
    }
    
    // Announce winner
    function announceWinner(winner) {
        gameActive = false;
        if (winner === "X") {
            statusDisplay.textContent = "You won! 🎉";
        } else {
            statusDisplay.textContent = "Computer won! 🤖";
        }
    }
    
    // Announce draw
    function announceDraw() {
        gameActive = false;
        statusDisplay.textContent = "Game ended in a draw! 🤝";
    }
    
    // Event listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', initializeGame);
    resetButton.addEventListener('mousedown', () => sounds.click.play());
    
    // Initialize the game
    initializeGame();
});