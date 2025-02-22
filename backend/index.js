import express from "express";
import cors from "cors";
import chessRoutes from './routes/index.js';

const app = express();
const port = 6000;

app.use(cors());
app.use(express.json());



// Use the chess routes
app.use("/", chessRoutes);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
