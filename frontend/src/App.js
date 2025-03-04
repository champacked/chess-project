import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js'
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FlipIcon from '@mui/icons-material/Flip';
import axios from 'axios';
import './App.css';


const API_URL = `${process.env.REACT_APP_API_URL}`;
console.log(API_URL);


function App() {
  
  const game = new Chess()
  const [fen, setFen] = useState(game.fen());
  const [gameStatus, setGameStatus] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [PlayerTurn, setPlayerTurn] = useState('');
  const [moveList, setMoveList] = useState([]);
  const [currentHistoryPointer, setCurrentHistoryPointer] = useState(0)
  
  const startNewGame = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/new-game`);
      setFen(response.data.fen);
      setIsGameOver(false);
      setWinner('');
      setGameStatus('Game Status: Playing');
      setPlayerTurn(response?.data?.turn);
      setMoveList([])
      setCurrentHistoryPointer(0);


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
      // console.log(response.data);
      setPlayerTurn(response?.data?.turn);
      setMoveList(response?.data?.moveList || []);

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
      setMoveList(response?.data?.moveList || []);
      // console.log(response.data.moveList);

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



  const handleStepBack = async() => {
   
    
    try {
      console.log(currentHistoryPointer)
      if(moveList&&moveList.length>0&&currentHistoryPointer<moveList.length)
        {

          const stepback=moveList[moveList.length-1-currentHistoryPointer]
          
        
          console.log(currentHistoryPointer)
          
          const response = await axios.get(`${API_URL}/step-back`, {
            params: { stepback }
          });
          
          setFen(response?.data?.fen);
          setPlayerTurn(response?.data?.turn)
          console.log(response);
          console.log(moveList);
          
          setCurrentHistoryPointer((prev)=>prev+1);
          
          
        }else
        {
          alert("fhfhhfhf")
        }
      
      } catch (error) {
        console.error('Error checking game result:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error checking game result: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  }
  
  const handleStepAhead = async() => {
   
    
    try {
       
      if(moveList&&moveList.length>0&&currentHistoryPointer<moveList.length)
        {
         
          const stepahead=moveList[moveList.length-currentHistoryPointer]
          
          
          console.log(currentHistoryPointer)
          console.log(moveList.length);
          
          const response = await axios.get(`${API_URL}/step-ahead`, {
            params: { stepahead }
          });
          
          setFen(response?.data?.fen);
          setPlayerTurn(response?.data?.turn)
          
          
          
          setCurrentHistoryPointer((prev)=>prev-1);
        }else
        {
          alert("fhfhhfhf")
        }
      
    } catch (error) {
      console.error('Error checking game result:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error checking game result: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  }
  const handleMoveEnd = async() => {
   
    
    try {
       
      if(moveList&&moveList.length>0)
        {
         
          const response = await axios.get(`${API_URL}/move-end`);
          
          setFen(response?.data?.fen);
          setPlayerTurn(response?.data?.turn)
          setMoveList(response?.data?.moveList);         
          
         
        }else
        {
          alert("fhfhhfhf")
        }
      
    } catch (error) {
      console.error('Error checking game result:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error checking game result: ${error.response?.data?.error || 'Please start a new game'}`);
      }
    }
  }


  const handleDrawGame = async () => {
    try {
      const response = await axios.post(`${API_URL}/draw-game`);
      console.log(response.data.message);
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

  const handleResignGame = async () => {
    try {
      const response = await axios.post(`${API_URL}/resign-game`);
      console.log(response.data.message);
      setIsGameOver(response?.data?.gameOver);
      setGameStatus(response.data.message || 'Game resigned');
    } catch (error) {
      console.error('Error resigning game:', error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        setGameStatus('Lost connection to the game server. Please check if the backend is running.');
      } else {
        setGameStatus(`Error resigning game: ${error.response?.data?.error || 'Please start a new game'}`);
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
      <h2>Chess Game {currentHistoryPointer}</h2>
      <button>{(PlayerTurn === 'w' && "Your's Turn") || (PlayerTurn === 'b' && "Computer's Turn")}</button>
      <div className='main-container'>

        <div className="board-container">
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardWidth={450}
            areArrowsAllowed={true}
            showBoardNotation={true}
            boardOrientation="white"
            customDarkSquareStyle={{ backgroundColor: '#b58863' }}
            customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            animationDuration={200}
            customDropSquareStyle={{ boxShadow: 'inset 0 0 1px 4px yellow' }}
          />

          <div className='game-Btn'>
            <SkipPreviousIcon onClick={startNewGame} />
            <ChevronLeftIcon onClick={handleStepBack} />
            <ChevronRightIcon onClick={handleStepAhead} />
            <SkipNextIcon onClick={handleMoveEnd} />
            <FlipIcon />
            <ReplayIcon onClick={handleUndoMove} />
          </div>

          <div className="game-status">
            <button onClick={startNewGame} className="new-game-btn">
              Reset Game
            </button>
            <button onClick={handleResignGame} className="new-game-btn">
              Resign Game
            </button>
            <button onClick={handleDrawGame} className="new-game-btn">
              Draw
            </button>
            <p>{gameStatus}</p>
          </div>
        </div>
        <div className="move-list">
          <h3>Move List</h3>
          <div className="moves-container">
            {moveList && moveList.length > 0 &&
              moveList.map((move, index) =>
                index % 2 === 0 ? (
                  <div key={index} className="move-item">

                    <span className="white-move">{Math.floor(index / 2) + 1}. {move}</span>
                    <span className="black-move">{moveList[index + 1] || ''}</span>
                  </div>
                ) : null
              )}
          </div>
        </div>


      </div>


      
    </div>
  );
}


export default App;