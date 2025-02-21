import { Chess } from "chess.js";
import fetch from "node-fetch";

let game = new Chess();

export const startGame = async (req, res) => {
    game = new Chess(); 

    return res.json({ message: "New game started", fen: game.fen() });
};

export const playerMove = async (req, res) => {

    const { move } = req.body;

    if (!move) {
        return res.status(400).json({ error: "Move is required" });
    }

    if (game.isGameOver()) {
        return res.status(404).json({ error: "Game is over" });
    }


    const validTurn = game.turn();

    if (validTurn !== 'w') {
        return res.status(400).json({ error: "Invalid turn" });
    }

    try {

        const result = game.move(move);
        console.log("not allowed move ", result)
        if (!result) {
            return res.status(400).json({ error: "Invalid move" });
        }

        return res.json({
            message: "Move applied",
            move: result,
            fen: game.fen(),
            gameOver: game.isGameOver()
        });

    } catch (error) {

        return res.status(500).json({ error: "Invalid move", details: error.message });
    }

};

export const aiMove = async (req, res) => {

    if (game.isGameOver()) {

        return res.status(401).json({ error: "Game is over" });
    }

    try {

        const fen = game.fen();
        const depth = 12;

        const response = await fetch(
            `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`
        );

        const data = await response.json();

        if (data && !data.success || !data.bestmove) {

            return res.status(500).json({ error: "Stockfish API error" });
        }

        const bestMove = data.bestmove.split(" ")[1];
        const result = game.move(bestMove);

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

        return res.status(200).json({
            message: "AI moved",
            bestMove,
            fen: game.fen(),
            evaluation: data.evaluation,
            mate: data.mate,
            gameOver: game.isGameOver()

        });

    } catch (error) {

        return res.status(500).json({ error: "Failed to get AI move" });
    }
};

export const getPosition = async (req, res) => {
    return res.status(200).json({ fen: game.fen(), turn: game.turn() });
};


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
            winner: `No one `,
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

