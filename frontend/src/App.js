import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';
import './App.css';


const API_URL = `${process.env.REACT_APP_API_URL}`;
console.log(API_URL);


function App() {

  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [gameStatus, setGameStatus] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [PlayerTurn, setPlayerTurn] = useState('');

  const startNewGame = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/new-game`);
      setFen(response.data.fen);
      setIsGameOver(false);
      setWinner('');
      setGameStatus('Game Status: Playing');
      setPlayerTurn(response?.data?.turn);

    } catch (error) {
      console.error('Error starting new game:', error);
      setGameStatus(`Error starting new game: ${error.response?.data?.error || error.message}`);

    }
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Update current turn whenever FEN changes
  useEffect(() => {
    const turn = fen.split(' ')[1];
    setPlayerTurn(turn);
  }, [fen]);

  const makeMove = async (move) => {
    if (isGameOver) {
      setGameStatus('Game is over. Please start a new game.');
      return false;
    }

    try {
      const response = await axios.post(`${API_URL}/move`, { move });
      setFen(response.data.fen);
      console.log(response.data.turn);
      setPlayerTurn(response?.data?.turn);
      if (response.data.gameOver) {
        await checkGameResult();
      } else {
        await makeAIMove();
      }
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Invalid move: ${error.response?.data?.error || 'Please try again'}`);
      }
      return false;
    }
  };

  const makeAIMove = async () => {
    try {
      setGameStatus('AI is thinking...');
      const response = await axios.get(`${API_URL}/ai-move`);
      setFen(response.data.fen);
      setPlayerTurn(response?.data?.turn)

      if (response.data.gameOver) {
        await checkGameResult();
      } else {
        setGameStatus('Game Status: Playing');
      }
    } catch (error) {
      console.error('Error making AI move:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`AI move error: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  };

  const checkGameResult = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-game-result`);
      setIsGameOver(response.data.gameOver);
      setWinner(response.data.winner);
      setGameStatus(`Game Over! ${response.data.message}${response.data.winner ? ` Winner: ${response.data.winner}` : ''}`);
    } catch (error) {
      console.error('Error checking game result:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error checking game result: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  };

  const handleUndoMove = async () => {
    try {
      const response = await axios.get(`${API_URL}/undo-move`);
      console.log("undo move :", response.data);
      setIsGameOver(response.data?.gameOver);
      setWinner(response.data.winner);
      setGameStatus('undo move done!!!');
      setFen(response?.data?.fen)
    } catch (error) {
      console.error('Error checking game result:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error checking game result: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  };

  const handleDrawGame = async () => {
    try {
      const response = await axios.post(`${API_URL}/draw-game`);
      console.log( response.data.message);
      setIsGameOver(response.data?.isGameDraw);
      setGameStatus('Game is Drawn');
     
    } catch (error) {
      console.error('Error checking game result:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error checking game result: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  };



  const onDrop = (sourceSquare, targetSquare) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity
    };

    return makeMove(move);
  };

  return (
    <div className="app">
      <h1>Chess Game</h1>
      <button>{(PlayerTurn === 'w' && "Your's Turn" )||(PlayerTurn === 'b' && "Computer's Turn")}</button>

      <div className="board-container">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardWidth={400}
          areArrowsAllowed={true}
          showBoardNotation={true}
          boardOrientation="white"
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
          animationDuration={200}
          customDropSquareStyle={{ boxShadow: 'inset 0 0 1px 4px yellow' }}
        />
       
      </div>
      <div className='game-Btn'>
        <button onClick={startNewGame} className="new-game-btn">
          Reset Game
        </button>
        <button onClick={handleUndoMove} className="new-game-btn">
          Undo Move
        </button>
        <button onClick={handleDrawGame} className="new-game-btn">
          Draw
        </button>
      </div>
      <div className="game-status">
        <p>{gameStatus}</p>
      </div>

    </div>
  );
}

export default App;