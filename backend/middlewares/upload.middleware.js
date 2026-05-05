import multer from "multer";
import { env } from "../config/env.js";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: env.uploadMaxSizeMb * 1024 * 1024,
    },
});

export const singleUpload = upload.single("file");

export const profilePhotoUpload = upload.single("profilePhoto");

export const companyLogoUpload = upload.single("file");

export const resumeUpload = upload.single("resume");

export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
        console.error("Unknown upload error:", err);
        return res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
    next();
};
