import express from "express";
import cors from "cors";
import { Chess } from "chess.js";
import fetch from "node-fetch"; 

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

let game = new Chess(); 

app.get("/",(res,req) => { 
console.log("hello backend is up");
})


// Validate and apply a move
app.post("/move", (req, res) => {
    const { move } = req.body;

    if (!move) {
        return res.status(400).json({ error: "Move is required" });
    }

    const result = game.move(move);
    if (!result) {
        return res.status(400).json({ error: "Invalid move" });
    }

    res.json({ 
        message: "Move applied", 
        move: result, 
        fen: game.fen(), 
        gameOver: game.isGameOver() 
    });
});

// Get Stockfish AI move
app.get("/ai-move", async (req, res) => {
    console.log("entered here");

    if (game.isGameOver()) {
        return res.json({ error: "Game is over" });
    }

    try {
        
        const fen = game.fen();
        const depth = 15; 

        // Fetch best move from Stockfish API
        const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`);
        const data = await response.json();

        if (!data.success || !data.bestmove) {
            return res.status(500).json({ error: "Stockfish API error" });
        }

        const bestMove = data.bestmove.split(" ")[1]; 
        const result = game.move(bestMove); 

        if (!result) {
            return res.status(500).json({ error: "AI move was invalid" });
        }

        res.json({ 
            message: "AI moved", 
            bestMove, 
            fen: game.fen(), 
            evaluation: data.evaluation, 
            mate: data.mate,
            gameOver: game.isGameOver()
        });
    } catch (error) {
        console.error("Error fetching from Stockfish API:", error);
        res.status(500).json({ error: "Failed to get AI move" });
    }
});

// Get current board position
app.get("/position", (req, res) => {
    res.json({ fen: game.fen(), turn: game.turn() });
});

app.listen(port, (err) => {
    if(err)
        {
            console.log(`Error in running the server: ${err}`);

        }
    console.log(`Server running on port: ${port}`);
});
