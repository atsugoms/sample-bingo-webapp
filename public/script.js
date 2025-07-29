class BingoGame {
    constructor() {
        this.setupSection = document.getElementById('setup-section');
        this.gameSection = document.getElementById('game-section');
        this.numbersSection = document.getElementById('numbers-section');
        
        this.maxNumberInput = document.getElementById('max-number');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.drawBtn = document.getElementById('draw-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.gameRangeSpan = document.getElementById('game-range');
        this.remainingCountSpan = document.getElementById('remaining-count');
        this.drawnNumberSpan = document.getElementById('drawn-number');
        this.currentNumberDiv = document.getElementById('current-number');
        this.drawnNumbersDiv = document.getElementById('drawn-numbers');
        
        this.initEventListeners();
        this.loadGameState();
    }
    
    initEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.drawBtn.addEventListener('click', () => this.drawNumber());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        // Allow starting game with Enter key
        this.maxNumberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }
    
    async loadGameState() {
        try {
            const response = await fetch('/api/game-state');
            const gameState = await response.json();
            
            if (gameState.isGameStarted) {
                this.updateUI(gameState);
                this.showGameSections();
                this.initializeAllNumbers(gameState.maxNumber);
                this.updateDrawnNumbersList(gameState.drawnNumbers);
            }
        } catch (error) {
            console.error('Error loading game state:', error);
        }
    }
    
    async startGame() {
        const maxNumber = parseInt(this.maxNumberInput.value);
        
        if (!maxNumber || maxNumber < 1 || maxNumber > 1000) {
            this.showMessage('1から1000の間の数字を入力してください', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/start-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ maxNumber })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showMessage(`ゲームを開始しました！範囲: 1-${maxNumber}`, 'success');
                this.updateUI({
                    maxNumber: result.maxNumber,
                    drawnNumbers: result.drawnNumbers,
                    remainingNumbers: result.maxNumber,
                    isGameStarted: true
                });
                this.showGameSections();
                this.drawnNumberSpan.textContent = '-';
                this.initializeAllNumbers(result.maxNumber);
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Error starting game:', error);
            this.showMessage('ゲーム開始中にエラーが発生しました', 'error');
        }
    }
    
    async drawNumber() {
        try {
            const response = await fetch('/api/draw-number', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.animateNumberDraw(result.drawnNumber);
                this.updateUI({
                    drawnNumbers: result.drawnNumbers,
                    remainingNumbers: result.remainingNumbers
                });
                this.updateDrawnNumbersList(result.drawnNumbers);
                
                if (result.remainingNumbers === 0) {
                    this.drawBtn.disabled = true;
                    this.showMessage('すべての数字が抽選されました！', 'success');
                }
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Error drawing number:', error);
            this.showMessage('数字抽選中にエラーが発生しました', 'error');
        }
    }
    
    async resetGame() {
        if (!confirm('ゲームをリセットしますか？')) {
            return;
        }
        
        try {
            const response = await fetch('/api/reset-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showMessage('ゲームをリセットしました', 'success');
                this.hideGameSections();
                this.maxNumberInput.value = '';
                this.drawnNumbersDiv.innerHTML = '';
                this.drawnNumberSpan.textContent = '-';
                this.drawBtn.disabled = false;
            } else {
                this.showMessage('リセット中にエラーが発生しました', 'error');
            }
        } catch (error) {
            console.error('Error resetting game:', error);
            this.showMessage('リセット中にエラーが発生しました', 'error');
        }
    }
    
    updateUI(gameState) {
        if (gameState.maxNumber) {
            this.gameRangeSpan.textContent = gameState.maxNumber;
        }
        if (gameState.remainingNumbers !== undefined) {
            this.remainingCountSpan.textContent = gameState.remainingNumbers;
        }
        if (gameState.drawnNumbers) {
            this.updateDrawnNumbersList(gameState.drawnNumbers);
        }
    }
    
    initializeAllNumbers(maxNumber) {
        this.drawnNumbersDiv.innerHTML = '';
        for (let i = 1; i <= maxNumber; i++) {
            const chip = document.createElement('div');
            chip.className = 'number-chip undrawn';
            chip.textContent = i;
            chip.id = `number-${i}`;
            this.drawnNumbersDiv.appendChild(chip);
        }
    }

    updateDrawnNumbersList(drawnNumbers) {
        drawnNumbers.forEach(number => {
            const chip = document.getElementById(`number-${number}`);
            if (chip && chip.classList.contains('undrawn')) {
                chip.classList.remove('undrawn');
                chip.classList.add('drawn');
            }
        });
    }
    
    animateNumberDraw(number) {
        this.drawnNumberSpan.textContent = number;
        this.currentNumberDiv.classList.add('animated');
        
        setTimeout(() => {
            this.currentNumberDiv.classList.remove('animated');
        }, 500);
    }
    
    showGameSections() {
        this.gameSection.style.display = 'block';
        this.numbersSection.style.display = 'block';
    }
    
    hideGameSections() {
        this.gameSection.style.display = 'none';
        this.numbersSection.style.display = 'none';
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;
        
        // Insert after the setup section
        this.setupSection.insertAdjacentElement('afterend', messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
});