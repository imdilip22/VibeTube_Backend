import { Router } from "express";
import { getProfileController, updateProfileController } from "../../controller/profile/profile.controller";
import multer from "multer";
import path from "path";
import fs from "fs";

export const profileRouter = Router();

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PROFILES_DIR = path.join(UPLOAD_ROOT, "profiles");
const COVERS_DIR = path.join(UPLOAD_ROOT, "covers");

// Ensure directories exist
[PROFILES_DIR, COVERS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed."));
};

// Combined profile uploader: routes each field to its correct directory
const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      cb(null, file.fieldname === "avatar" ? PROFILES_DIR : COVERS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
]);

// GET /profile — returns the authenticated user's profile
profileRouter.get("/", getProfileController);

// PUT /profile — update name and/or upload avatar + cover in one request
profileRouter.put("/", profileUpload, updateProfileController);
