import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const PROFILES_DIR = path.join(UPLOAD_ROOT, "profiles");
const COVERS_DIR = path.join(UPLOAD_ROOT, "covers");

// Ensure directories exist at startup
[PROFILES_DIR, COVERS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

// Avatar uploader (2 MB max)
export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PROFILES_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Cover photo uploader (5 MB max)
export const coverUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, COVERS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Combined uploader for register (avatar + cover in one request)
export const registerUpload = multer({
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
});

export const UPLOAD_BASE_URL = "/uploads";
