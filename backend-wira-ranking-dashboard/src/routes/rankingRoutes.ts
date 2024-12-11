import { Router } from "express";
import { getRankings } from "../controllers/rankingController";

const router = Router();

router.get("/", getRankings);

export default router;
