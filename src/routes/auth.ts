import express, { Request, Response, NextFunction } from "express";
import { login, signUp } from "../controllers/authController";
import { profileUpload, processProfileImage } from "../helpers/multer";

const router = express.Router();

router.post(
  "/sign-up",
  profileUpload.single("profileImage"),
  processProfileImage,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await signUp(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await login(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
