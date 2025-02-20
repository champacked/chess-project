import { Chess } from "chess.js";
import fetch from "node-fetch";

let game = new Chess(); 

export const startGame =async (req, res) => {
    game = new Chess(); 
    return res.json({ message: "New game started", fen: game.fen() });
};

export const playerMove = async (req, res) => {
    const { move } = req.body;

    if (!move) {
        return res.status(400).json({ error: "Move is required" });
    }

    const result = game.move(move);
    if (!result) {
        return res.status(400).json({ error: "Invalid move" });
    }

    return res.json({ 
        message: "Move applied", 
        move: result, 
        fen: game.fen(), 
        gameOver: game.isGameOver() 
    });
};

export const aiMove = async (req, res) => {
    
    if (game.isGameOver()) {
        return res.json({ error: "Game is over" });
    }

    try {
        const fen = game.fen();
        const depth = 15;

        const response = await fetch(
            `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`
        );
        const data = await response.json();

        if (!data.success || !data.bestmove) {
            return res.status(500).json({ error: "Stockfish API error" });
        }

        const bestMove = data.bestmove.split(" ")[1];
        const result = game.move(bestMove);

        if (!result) {
            return res.status(500).json({ error: "AI move was invalid" });
        }

        return res.json({ 
            message: "AI moved", 
            bestMove, 
            fen: game.fen(), 
            evaluation: data.evaluation, 
            mate: data.mate,
            gameOver: game.isGameOver()
        });
    } catch (error) {
        console.error("Error fetching from Stockfish API:", error);
        return res.status(500).json({ error: "Failed to get AI move" });
    }
};

export const getPosition = async (req, res) => {
    return res.json({ fen: game.fen(), turn: game.turn() });
};
