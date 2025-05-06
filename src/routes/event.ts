import express, { Request, Response, NextFunction } from "express";
import { auth } from "../middlewares/token-decode";
import { eventUpload, processEventPoster } from "../helpers/multer";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/eventController";

const router = express.Router();

router.post(
  "/",
  auth,
  eventUpload.single("poster"),
  processEventPoster,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createEvent(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllEvents(req, res);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/my-events",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getMyEvents(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getEventById(req, res);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  auth,
  eventUpload.single("poster"),
  processEventPoster,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateEvent(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteEvent(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
