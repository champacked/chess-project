
import express from "express";
import { startGame, playerMove, aiMove, getPosition , getGameResult, undoMove , moveTurn , drawGame} from "../controller/chess.js";
const routes = express.Router();

routes.get("/new-game", startGame);
routes.post("/move", playerMove);
routes.get("/ai-move", aiMove);
routes.get("/position", getPosition);
routes.get("/get-game-result", getGameResult);
routes.get("/undo-move", undoMove);
routes.get("/move-turn", moveTurn)
routes.post("/draw-game", drawGame);



export default routes;