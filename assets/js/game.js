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

// Best scores object
const bestScores = {
    easy: null,
    hard: null
};

// Emojis
const emojis = ['🌈​', '​💧', '​🔥​', '​❄️', '⚡​', '​🌀​', '​🌧️​', '​​🌙​​', '​​​⭐​', '​​​🪐​', '​🌏​​​​', '​​🌊​'];

// localStorage functions
function loadBestScores() {
    try {
        const savedEasy = localStorage.getItem('memoryGame_best_easy');
        const savedHard = localStorage.getItem('memoryGame_best_hard');
        
        if (savedEasy) {
            bestScores.easy = JSON.parse(savedEasy);
            console.log('Loaded Easy best score:', bestScores.easy);
        }
        
        if (savedHard) {
            bestScores.hard = JSON.parse(savedHard);
            console.log('Loaded Hard best score:', bestScores.hard);
        }
        
        updateBestScoresDisplay();
    } catch (error) {
        console.error('Error loading best scores:', error);
    }
}

function saveBestScore(difficulty, moves, time) {
    try {
        const scoreData = { moves, time, date: new Date().toISOString() };
        localStorage.setItem(`memoryGame_best_${difficulty}`, JSON.stringify(scoreData));
        console.log(`Saved new best score for ${difficulty}:`, scoreData);
    } catch (error) {
        console.error('Error saving best score:', error);
    }
}

function updateBestScoresDisplay() {
    // Find or create best scores display elements
    let easyBestDisplay = document.querySelector('.best-easy');
    let hardBestDisplay = document.querySelector('.best-hard');
    
    // If elements don't exist, create them in the stats panel
    if (!easyBestDisplay || !hardBestDisplay) {
        const statsPanel = document.querySelector('.stats') || document.querySelector('.game-info');
        
        if (statsPanel) {
            // Check if best scores container already exists
            let bestScoresContainer = document.querySelector('.best-scores');
            
            if (!bestScoresContainer) {
                bestScoresContainer = document.createElement('div');
                bestScoresContainer.className = 'best-scores';
                bestScoresContainer.style.cssText = `
                    margin-top: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px solid #e0e0e0;
                `;
                
                bestScoresContainer.innerHTML = `
                    <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">Best Scores</h3>
                    <div class="best-easy" style="margin: 8px 0; padding: 8px; background: white; border-radius: 5px;">
                        <strong>Easy:</strong> <span class="best-easy-value">No record yet</span>
                    </div>
                    <div class="best-hard" style="margin: 8px 0; padding: 8px; background: white; border-radius: 5px;">
                        <strong>Hard:</strong> <span class="best-hard-value">No record yet</span>
                    </div>
                `;
                
                statsPanel.appendChild(bestScoresContainer);
            }
            
            easyBestDisplay = document.querySelector('.best-easy-value');
            hardBestDisplay = document.querySelector('.best-hard-value');
        }
    } else {
        easyBestDisplay = document.querySelector('.best-easy-value');
        hardBestDisplay = document.querySelector('.best-hard-value');
    }
    
    // Update the display values
    if (easyBestDisplay) {
        if (bestScores.easy) {
            easyBestDisplay.innerHTML = `${bestScores.easy.moves} moves (${bestScores.easy.time}s)`;
            easyBestDisplay.style.color = '#27ae60';
            easyBestDisplay.style.fontWeight = 'bold';
        } else {
            easyBestDisplay.textContent = 'No record yet';
            easyBestDisplay.style.color = '#95a5a6';
        }
    }
    
    if (hardBestDisplay) {
        if (bestScores.hard) {
            hardBestDisplay.innerHTML = `${bestScores.hard.moves} moves (${bestScores.hard.time}s)`;
            hardBestDisplay.style.color = '#27ae60';
            hardBestDisplay.style.fontWeight = 'bold';
        } else {
            hardBestDisplay.textContent = 'No record yet';
            hardBestDisplay.style.color = '#95a5a6';
        }
    }
}

function checkAndUpdateBestScore(difficulty, moves, time) {
    const currentBest = bestScores[difficulty];
    
    // If no best score exists, or current moves is better (fewer)
    if (!currentBest || moves < currentBest.moves) {
        console.log(`🎉 NEW BEST SCORE for ${difficulty}! Previous: ${currentBest ? currentBest.moves : 'none'}, New: ${moves}`);
        
        bestScores[difficulty] = { moves, time };
        saveBestScore(difficulty, moves, time);
        updateBestScoresDisplay();
        
        // Show congratulations message
        showNewRecordMessage(difficulty, moves, time);
        return true;
    }
    
    return false;
}

function showNewRecordMessage(difficulty, moves, time) {
    const message = document.createElement('div');
    message.className = 'new-record-popup';
    message.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🏆</div>
        <div style="font-weight: bold; font-size: 18px; margin-bottom: 5px;">NEW RECORD!</div>
        <div>${difficulty.toUpperCase()}: ${moves} moves in ${time}s</div>
    `;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        animation: popIn 0.5s ease-out;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#record-animation')) {
        const style = document.createElement('style');
        style.id = 'record-animation';
        style.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.transition = 'opacity 0.5s';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
    }, 3000);
}

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
        
        // Check and update best score
        checkAndUpdateBestScore(state.currentDifficulty, state.totalFlips, state.totalTime);
        
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
    
    // Load best scores from localStorage
    loadBestScores();
    
    initDifficulty();
    
    generateCards();
    
    console.log('Ready! You can now:');
    console.log('1. Select Easy (4x3) or Hard (6x4)');
    console.log('2. See the grid change immediately');
    console.log('3. Click Start when ready');
    console.log('4. Best scores are saved automatically!');
});

window.start = start;

window.restart = restart;
