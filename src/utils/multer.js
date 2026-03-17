import multer from "multer";
import fs from "fs";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "./cloudinary.js";

const localDir = path.resolve(process.cwd(), "uploads");

const disk = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    cb(null, localDir);
  },
  filename: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
  },
});

const cloud = new CloudinaryStorage({
  cloudinary,
  params: { folder: "eclectica_payments", allowed_formats: ["jpg","jpeg","png","webp","heic","heif"] },
});

export const upload = multer({
  storage: isCloudinaryConfigured ? cloud : disk,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(Object.assign(new Error("Only images allowed"), { status: 400 }));
  },
});
