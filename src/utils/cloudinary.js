import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const configured = Boolean(
  process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name:  process.env.CLOUD_NAME.trim(),
    api_key:     process.env.CLOUD_API_KEY.trim(),
    api_secret:  process.env.CLOUD_API_SECRET.trim(),
  });
} else {
  console.warn("⚠️  Cloudinary not configured — using local disk storage");
}

export { configured as isCloudinaryConfigured };
export default cloudinary;
