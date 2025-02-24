
import express from "express";
import { startGame, playerMove, aiMove, getPosition , getGameResult } from "../controller/chess.js";

const routes = express.Router();

routes.get("/new-game", startGame);
routes.post("/move", playerMove);
routes.get("/ai-move", aiMove);
routes.get("/position", getPosition);
routes.get("/get-game-result", getGameResult);

export default routes;