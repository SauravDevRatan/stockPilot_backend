import {Router} from "express";
import { holdingViewer } from "../controllers/holdingViewController.js";
import {verifyJwt} from "../middleware/authMiddleware.js";

const router = Router();

router.get("/holdingData", verifyJwt, holdingViewer);

export default router;
