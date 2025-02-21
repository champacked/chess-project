import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());

  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      return result;
    } catch (error) { 
      return null;
    }
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });

    // illegal move
    if (move === null) return false;
    return true;
  }

  function resetGame() {
    setGame(new Chess());
  }

  return (
    <div className="app">
      <h1>Chess Game</h1>
      <div className="board-container">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={400} />
      </div>
      <div className="controls">
        <button onClick={resetGame}>Reset Game</button>
        <p>Game Status: {game.game_over() ? 'Game Over' : 'Playing'}</p>
        {game.in_checkmate() && <p>Checkmate!</p>}
        {game.in_draw() && <p>Draw!</p>}
      </div>
    </div>
  );
}

export default App;