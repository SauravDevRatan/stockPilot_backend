import {Router} from "express";
import { tradeStock } from "../controllers/tradeController.js";
import {verifyJwt} from "../middleware/authMiddleware.js";

const router = Router();

router.post("/trade", verifyJwt, tradeStock);

export default router;
