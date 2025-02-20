
import express from "express";
import { startGame, playerMove, aiMove, getPosition } from "../controller/chess.js";

const routes = express.Router();

routes.get("/new-game", startGame);
routes.post("/move", playerMove);
routes.get("/ai-move", aiMove);
routes.get("/position", getPosition);

export default routes;
