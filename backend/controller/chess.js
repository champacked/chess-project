import { Chess } from "chess.js";
import fetch from "node-fetch";

let game = new Chess();

let moveList = [];

// start the game 
export const startGame = async (req, res) => {
    game = new Chess();

    return res.json({ message: "New game started", fen: game.fen(), turn: game.turn() });
};


//  get user move 
export const playerMove = async (req, res) => {

    const { move } = req.body;

    if (!move) {
        return res.status(400).json({ error: "Move is required" });
    }

    if (game.isGameOver()) {
        return res.status(404).json({ error: "Game is over" })
    }


    const validTurn = game.turn();

    if (validTurn !== 'w') {
        return res.status(400).json({ error: "Invalid turn" });
    }

    try {

        moveList = game.history();
        const result = game.move(move);
        // console.log("move ", result)
        // console.log(game.history());
        if (!result) {
            return res.status(400).json({ error: "Invalid move" });
        }

        return res.json({
            message: "Move applied",
            move: result,
            fen: game.fen(),
            turn: game.turn(),
            gameOver: game.isGameOver(),
            moveList: moveList,
        });

    } catch (error) {

        return res.status(500).json({ error: "Invalid move", details: error.message });
    }

};

// get AI move (Automatic move using stockfish api)
export const aiMove = async (req, res) => {

    // if game already over 

    if (game.isGameOver()) {

        return res.status(401).json({ error: "Game is over" });
    }

    const validTurn = game.turn();
    if (validTurn === 'b') {


        // find best move 
        try {

            const fen = game.fen();
            const depth = 12;

            const response = await fetch(
                `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`
            );

            const data = await response.json();


            if (!data && !data.success || !data.bestmove) {

                return res.status(500).json({ error: "Stockfish API  error" });
            }

            const bestMove = data.bestmove?.split(" ")[1] || data.bestmove;
            const result = game.move(bestMove);
            // console.log("2", game.history());

            // after automatic move by stockfish check game is over

            if (game.isGameOver()) {
                return res.status(200).json(
                    {
                        message: "AI moved",
                        bestMove,
                        fen: game.fen(),
                        evaluation: data.evaluation,
                        mate: data.mate,
                        gameOver: game.isGameOver(),
                        winner: `${game.turn() === "w" ? "Black" : "White"}`,

                    })
            }

            if (!result) {
                return res.status(500).json({ error: "AI move was invalid" });
            }


            moveList = game.history();
            return res.status(200).json({
                message: "AI moved",
                bestMove,
                fen: game.fen(),
                evaluation: data.evaluation,
                mate: data.mate,
                gameOver: game.isGameOver(),
                turn: game.turn(),
                moveList: moveList,

            });


        } catch (error) {

            return res.status(500).json({ error: "Failed to get AI move" });
        }
    } else {
        return res.status(500).json({ error: "invalid turn" });
    }
};

// get position controller
export const getPosition = async (req, res) => {
    return res.status(200).json({ fen: game.fen(), turn: game.turn() });
};


// check the game result 
export const getGameResult = async (req, res) => {
    if (game.isCheckmate()) {
        return res.status(200).json({
            message: "Checkmate!",
            winner: `${game.turn() === "w" ? "Black" : "White"}`,
            gameOver: true
        });
    } else if (game.isDraw()) {
        return res.status(200).json({
            message: "Game Drawn",
            gameOver: true,
            winner: "No one",
        });
    } else if (game.isGameOver()) {
        return res.status(200).json({
            message: "Game Over",
            gameOver: true,
            winner: `${game.turn() === "w" ? "Black" : "White"}`,
        });
    } else {
        return res.status(200).json({
            message: "Game is still ongoing",
            gameOver: false
        });
    }
};

// undo move or go back to previous game state
export const undoMove = async (req, res) => {
    if (!game) {

        return res.status(401).json({ error: "Game is not initialized" });
    }
    else {
        let undo_move = game.undo();
        undo_move = game.undo();

        if (undo_move) {

            return res.status(200).json(
                {
                    fen: game.fen(),
                    turn: game.turn(),
                    gameOver: game.isGameOver(),

                })
        } else {
            return res.status(400).json(
                {
                    error: "there is No Move to undo!!!"
                })
        }
    }
}

//  go back to previous game state
export const gameStepBack = async (req, res) => {

    if (!game) {

        return res.status(401).json({ error: "Game is not initialized" });
    }
    else {
        let undo_move = game.undo();

        // console.log("<---", moveList);
        if (undo_move) {

            return res.status(200).json(
                {
                    fen: game.fen(),
                    turn: game.turn(),
                    gameOver: game.isGameOver(),

                })
        } else {
            return res.status(400).json(
                {
                    error: "there is No Move to go back !!!"
                })
        }
    }

}

export const gameStepAhead = async (req, res) => {

    if (!game) {

        return res.status(401).json({ error: "Game is not initialized" });
    }
    else {

        const { stepahead } = req.query;
        const redo_move = game.move(stepahead);

        if (redo_move) {
            
            return res.status(200).json(
                {
                    fen: game.fen(),
                    turn: game.turn(),
                    gameOver: game.isGameOver(),

                })
                
        } else {
            return res.status(400).json(
                {
                    error: "there is No Move to go back !!!"
                })
        }
    }

}


export const moveEnd = async (req, res) => {
    try {
        if (!game) {
            return res.status(401).json({ error: "Game is not initialized" });
        }

        if (!moveList || moveList.length === 0) {
            return res.status(400).json({ error: "No moves available to replay!" });
        }
    
        game.reset();
        let lastValidMove;
        for (let move of moveList) {    
            lastValidMove = game.move(move);
            if (!lastValidMove) {
                return res.status(400).json({ error: `Invalid move detected: ${JSON.stringify(move)}` });
            }
        }

        return res.status(200).json({
            fen: game.fen(),
            turn: game.turn(),
            gameOver: game.isGameOver(),
            moveList,
        });
    } catch (error) {
        console.error("Error in moveEnd:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};







// get the move turn 
export const moveTurn = async (req, res) => {
    if (!game) {

        return res.status(401).json({ error: "Game is not initialized" });
    }
    else {

        const turn = game.turn();

        if (turn) {
            return res.status(200).json(
                {
                    turn: turn

                })
        } else {
            return res.status(400).json(
                {
                    error: "invalid turn !!!"
                })
        }
    }


}


// draw game  
export const drawGame = async (req, res) => {

    try {
        if (!game) {
            return res.status(401).json({ error: "Game is not initialized" });
        }
        else if (game.isDrawByFiftyMoves()) {
            return res.status(200).json({
                message: "Draw By Fifty Moves",
            });
        } else if (game.isInsufficientMaterial()) {
            return res.status(200).json({
                message: "draw due InsufficientMaterial",
            });

        } else {

            const fen = game.fen();
            const depth = 12;

            const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`);


            const data = await response.json();
            if (data && data.evaluation && Math.abs(data.evaluation) < 10) {
                console.log(game.isDraw());
                return res.status(200).json({
                    message: "draw accepted",
                    isGameDraw: true
                });
            }

            return res.status(400).json({
                message: "draw delined",
                isGameDraw: false,

            });

        }
    } catch (error) {

        return res.status(500).json({ error: "Internal Server Error" });
    }

};

export const resignGame = async (req, res) => {
    if (!game) {
        return res.status(400).json({ error: "Game is not initialized" });
    }

    res.json({
        message: "Game over. A player has resigned.",
        gameOver: true,
    });
};
