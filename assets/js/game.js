// Selectors
const gridContainer = document.querySelector('.grid-container');
const movesDisplay = document.querySelector('.moves');
const timerDisplay = document.querySelector('.timer');
const startButton = document.querySelector('.btn-game[onclick*="start"]');
const restartButton = document.querySelector('.btn-game[onclick*="restart"]');
const difficultyButtons = document.querySelectorAll('.difficulty .btn-game');

// Game state
const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null,
    currentDifficulty: 'easy',
    gameWon: false
};

// Emojis
const emojis = ['🌈​', '​💧', '​🔥​', '​❄️', '⚡​', '​🌀​', '​🌧️​', '​​🌙​​', '​​​⭐​', '​​​🪐​', '​🌏​​​​', '​​🌊​'];

// Initialize difficulty buttons
function initDifficulty() {
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            state.currentDifficulty = this.textContent.toLowerCase();
            console.log('Difficulty set to:', state.currentDifficulty);
            
            updateGridLayout();
            
            generateCards();
            
            if (state.gameStarted && !state.gameWon) {
                state.flippedCards = 0;
                state.totalFlips = 0;
                
                if (movesDisplay) {
                    movesDisplay.textContent = 'Moves: 0';
                }
            }
        });
    });
    
    difficultyButtons[0].classList.add('active');
}

// Update grid layout based on difficulty
function updateGridLayout() {
    if (state.currentDifficulty === 'hard') {
        gridContainer.style.gridTemplateColumns = 'repeat(6, 140px)';
        gridContainer.style.gridTemplateRows = 'repeat(4, calc(140px / 2 * 3))';
    } else {
        gridContainer.style.gridTemplateColumns = 'repeat(4, 140px)';
        gridContainer.style.gridTemplateRows = 'repeat(3, calc(140px / 2 * 3))';
    }
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate cards
function generateCards() {
    gridContainer.innerHTML = '';
    
    state.gameWon = false;
    
    let pairs;
    if (state.currentDifficulty === 'hard') {
        pairs = 12;
    } else {
        pairs = 6;
    }
    
    const selectedEmojis = emojis.slice(0, pairs);
    
    let cards = [];
    selectedEmojis.forEach(emoji => {
        cards.push(emoji);
        cards.push(emoji);
    });
    
    cards = shuffleArray(cards);
    
    console.log(`Generating ${cards.length} cards for ${state.currentDifficulty} mode`);
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="front">
                <div class="emoji">${emoji}</div>
            </div>
            <div class="back"></div>
        `;
        
        if (state.gameStarted && !state.gameWon) {
            card.addEventListener('click', () => flipCard(card));
            card.style.cursor = 'pointer';
        } else {
            card.style.cursor = 'default';
        }
        
        gridContainer.appendChild(card);
    });
}

function checkWinCondition() {
    const totalCards = document.querySelectorAll('.card').length;
    const matchedCards = document.querySelectorAll('.card.matched').length;
    
    console.log(`Checking win: ${matchedCards}/${totalCards} cards matched`);
    
    if (matchedCards === totalCards && totalCards > 0) {
        state.gameWon = true;
        console.log('🎉 You won! All cards matched!');
        
        if (state.loop) {
            clearInterval(state.loop);
            console.log('Timer stopped at', state.totalTime, 'seconds');
        }
        
        document.querySelectorAll('.card').forEach(card => {
            card.style.cursor = 'default';
            card.removeEventListener('click', () => flipCard(card));
        });
        
        gridContainer.style.border = '3px solid #2ecc71';
        gridContainer.style.transition = 'border 0.5s';
        
        console.log(`Congratulations! You completed the game in ${state.totalTime} seconds with ${state.totalFlips} moves!`);
        
        return true;
    }
    return false;
}

// Flip card function
function flipCard(card) {
    if (!state.gameStarted || 
        state.gameWon ||
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        state.flippedCards >= 2) {
        return;
    }
    
    card.classList.add('flipped');
    state.flippedCards++;
    state.totalFlips++;
    
    if (movesDisplay) {
        movesDisplay.textContent = `Moves: ${state.totalFlips}`;
    }
    
    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.card.flipped:not(.matched)');
        
        if (flippedCards.length === 2) {
            const card1 = flippedCards[0];
            const card2 = flippedCards[1];
            
            if (card1.dataset.emoji === card2.dataset.emoji) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                
                card1.removeEventListener('click', () => flipCard(card1));
                card2.removeEventListener('click', () => flipCard(card2));
                
                setTimeout(() => {
                    state.flippedCards = 0;
                    
                    checkWinCondition();
                }, 500);
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    state.flippedCards = 0;
                }, 1000);
            }
        }
    }
}

// Start game function
function start() {
    if (!state.gameStarted) {
        state.gameStarted = true;
        state.gameWon = false;
        console.log('Game started in', state.currentDifficulty, 'mode');
        
        gridContainer.style.border = '';
        
        if (startButton) {
            startButton.disabled = true;
            startButton.textContent = 'Game Started';
        }
        
        state.loop = setInterval(() => {
            state.totalTime++;
            if (timerDisplay) {
                timerDisplay.textContent = `Time: ${state.totalTime}s`;
            }
        }, 1000);
        
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => flipCard(card));
            card.style.cursor = 'pointer';
        });
    }
}

// Restart game function
function restart() {
    console.log('Restarting game...');
    
    if (state.loop) {
        clearInterval(state.loop);
    }
    
    state.gameStarted = false;
    state.gameWon = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    
    if (movesDisplay) {
        movesDisplay.textContent = 'Moves: 0';
    }
    if (timerDisplay) {
        timerDisplay.textContent = 'Time: 0';
    }
    
    if (startButton) {
        startButton.disabled = false;
        startButton.textContent = 'Start';
    }
    
    gridContainer.style.border = '';
    
    generateCards();
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    console.log('Game initializing...');
    
    initDifficulty();
    
    generateCards();
    
    console.log('Ready! You can now:');
    console.log('1. Select Easy (4x3) or Hard (6x4)');
    console.log('2. See the grid change immediately');
    console.log('3. Click Start when ready');
});

window.start = start;

window.restart = restart;
