import express, { Response, Request, NextFunction } from "express";
const router = express.Router();
import { auth } from "../middlewares/token-decode";
import { joinEvent } from "../controllers/joinController";
    
router.post("/:eventId", auth, async (req, res, next) => {
  try {
    await joinEvent(req, res);
  } catch (error) {
    next(error);
  }

});

export default router;  
