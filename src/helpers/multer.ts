import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, "../../uploads/profile/original"),
    path.join(__dirname, "../../uploads/profile/optimized"),
    path.join(__dirname, "../../uploads/events/original"),
    path.join(__dirname, "../../uploads/events/optimized")
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
  }
};

// Profile Image Storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/profile/original"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Event Poster Storage
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/events/original");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Multer instances
export const profileUpload = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const eventUpload = multer({
  storage: eventStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB for event posters
});

export const processProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next();

    const originalPath = req.file.path;
    const optimizedFilename = `optimized-${req.file.filename}`;
    const optimizedPath = path.join(
      __dirname,
      "../../uploads/profile/optimized",
      optimizedFilename
    );

    await sharp(originalPath)
      .resize(800, 800, {
        fit: 'cover',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    req.body.profileImage = {
      original: path.join('uploads/profile/original', req.file.filename).replace(/\\/g, '/'),
      optimized: path.join('uploads/profile/optimized', optimizedFilename).replace(/\\/g, '/')
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const processEventPoster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next();

    const optimizedFilename = `optimized-${req.file.filename}`;
    const optimizedPath = path.join(
      __dirname,
      "../../uploads/events/optimized",
      optimizedFilename
    );

    await sharp(req.file.path)
      .resize(1200, 630, {
        fit: 'cover',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    req.body.poster = {
      original: path.join('uploads/events/original', req.file.filename).replace(/\\/g, '/'),
      optimized: path.join('uploads/events/optimized', optimizedFilename).replace(/\\/g, '/')
    };

    next();
  } catch (error) {
    next(error);
  }
};