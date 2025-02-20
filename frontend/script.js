
// Initialize game state
let gameState = {
    position: 'start',
    gameOver: false,
    connected: false,
    isPlayerTurn: true
};

// Backend API URL
const API_URL = 'http://localhost:8000';

// Board configuration
const config = {
    draggable: true,
    position: 'start',
    dropOffBoard: 'snapback',
    sparePieces: false,
    pieceTheme: 'chessboard/img/chesspieces/wikipedia/{piece}.png',
    snapSpeed: 100,
    onDrop: onPieceDrop
};

// Initialize the board
const board = Chessboard('chessboard', config);
const statusEl = document.getElementById('game-status');

// Handle piece drops
async function onPieceDrop(source, target, piece) {
    if (!gameState.connected) {
        updateStatus('Not connected to server. Please try again.');
        return 'snapback';
    }

    if (!gameState.isPlayerTurn) {
        updateStatus("It's not your turn!");
        return 'snapback';
    }

    // Construct the move
    const move = {
        move: source + '-' + target
    };

    try {
        // Send move to backend
        const response = await fetch(`${API_URL}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(move)
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();

        if (data.error) {
            updateStatus('Invalid move!');
            return 'snapback';
        }

        // Update game state
        gameState.position = data.fen;
        gameState.gameOver = data.gameOver;
        gameState.isPlayerTurn = false;

        // Update the board with the new position
        board.position(gameState.position);

        if (gameState.gameOver) {
            updateStatus('Game Over!');
            return;
        }

        // If game isn't over, get AI move
        updateStatus('AI is thinking...');
        await getAIMove();

    } catch (error) {
        console.error('Error making move:', error);
        updateStatus('Error making move. Please try again.');
        return 'snapback';
    }
}

// Get AI move from backend
async function getAIMove() {
    try {
        const response = await fetch(`${API_URL}/ai-move`);
        
        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();

        if (data.error) {
            console.error('AI move error:', data.error);
            updateStatus('Error getting AI move. Please try again.');
            return;
        }

        // Update game state
        gameState.position = data.fen;
        gameState.gameOver = data.gameOver;
        gameState.isPlayerTurn = true;

        // Update the board with AI's move
        board.position(gameState.position);

        if (data.evaluation) {
            updateStatus(`Your turn! (Position evaluation: ${data.evaluation})`);
        } else {
            updateStatus('Your turn!');
        }

        if (gameState.gameOver) {
            updateStatus('Game Over!');
        }

    } catch (error) {
        console.error('Error getting AI move:', error);
        updateStatus('Error getting AI move. Please try again.');
    }
}

// Update status message
function updateStatus(message) {
    statusEl.textContent = message;
}

// Event listeners for buttons
document.getElementById('flipBoard').addEventListener('click', function() {
    board.flip();
});

document.getElementById('startGame').addEventListener('click', async function() {
    try {
        const response = await fetch(`${API_URL}/new-game`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();
        
        gameState.position = data.fen;
        gameState.gameOver = false;
        gameState.isPlayerTurn = true;
        board.start();
        updateStatus('Game started! Your turn (playing as White)');
        
    } catch (error) {
        console.error('Error starting new game:', error);
        updateStatus('Error starting new game. Please try again.');
    }
});

document.getElementById('clearBoard').addEventListener('click', function() {
    board.clear();
    gameState.position = '';
    gameState.gameOver = false;
    updateStatus('Board cleared');
});

// Initialize the game
async function initGame() {
    try {
        const response = await fetch(`${API_URL}/position`);
        
        if (!response.ok) {
            throw new Error('Server error');
        }

        const data = await response.json();
        
        gameState.position = data.fen;
        gameState.connected = true;
        board.position(data.fen);
        updateStatus('Click "Start New Game" to begin!');
        
    } catch (error) {
        console.error('Error initializing game:', error);
        updateStatus('Could not connect to server. Please check if the server is running.');
        gameState.connected = false;
    }
}

// Initialize the game when the page loads
initGame();

// Check server connection periodically
setInterval(async () => {
    try {
        const response = await fetch(`${API_URL}/position`);
        gameState.connected = response.ok;
        if (!gameState.connected) {
            updateStatus('Lost connection to server!');
        }
    } catch (error) {
        gameState.connected = false;
        updateStatus('Lost connection to server!');
    }
}, 5000);





// var board = Chessboard('chessboard', {
//     draggable: true,
//     position: 'start',
//     dropOffBoard: 'snapback',
//     sparePieces: true,
//     pieceTheme: 'chessboard/img/chesspieces/wikipedia/{piece}.png',
//     snapSpeed: 100,
//     onDrop: onDrop,
// });

// function onDrop (source, target, piece, newPos, oldPos, orientation) {
//     console.log('Source: ' + source)
//     console.log('Target: ' + target)
//     console.log('Piece: ' + piece)
//     console.log('New position: ' + Chessboard.objToFen(newPos))
//     console.log('Old position: ' + Chessboard.objToFen(oldPos))
//     console.log('Orientation: ' + orientation)
//     console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
//   }
  


// // Event listeners
// document.getElementById('flipBoard').addEventListener('click', function () {
//     board.flip();
// });

// document.getElementById('resetBoard').addEventListener('click', function () {
//     newGame();
// });

// document.getElementById('clearBoard').addEventListener('click', function () {
//     board.clear();
// });



// // Start game on load
// newGame();


