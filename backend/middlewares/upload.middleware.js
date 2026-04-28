import multer from "multer";
import { env } from "../config/env.js";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: env.uploadMaxSizeMb * 1024 * 1024,
    },
});

export const singleUpload = upload.single("profilePhoto");

export const profilePhotoUpload = upload.single("profilePhoto");
