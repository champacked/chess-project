
import express from "express";
import { startGame, playerMove, aiMove, getPosition , getGameResult, undoMove , gameStepBack , gameStepAhead,moveEnd, moveTurn , drawGame, resignGame} from "../controller/chess.js";
const routes = express.Router();


routes.get("/new-game", startGame);
routes.post("/move", playerMove); 
routes.get("/ai-move", aiMove);
routes.get("/position", getPosition);
routes.get("/get-game-result", getGameResult);
routes.get("/undo-move", undoMove);
routes.get("/step-back", gameStepBack);
routes.get("/step-ahead", gameStepAhead);
routes.get("/move-end", moveEnd);
routes.get("/move-turn", moveTurn)
routes.post("/draw-game", drawGame);
routes.post("/resign-game", resignGame);




export default routes;