import express from "express";
import cors from "cors";
import chessRoutes from './routes/index.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT;

app.use(cors());
app.use(express.json());



// Use the chess routes
app.use("/", chessRoutes);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
