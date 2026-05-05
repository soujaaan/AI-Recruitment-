import fs from "fs/promises";
import path from "path";

const cloudinary = {
    uploader: {
        upload: async (dataUriContent) => {
            // dataUriContent is a base64 string formatted as: "data:image/png;base64,iVBORw0KGgo..."
            const matches = dataUriContent.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
                throw new Error("Invalid data URI format");
            }
            
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");
            
            const uploadDir = path.join(process.cwd(), "uploads");
            await fs.mkdir(uploadDir, { recursive: true });
            
            // Map common mimetypes to extensions
            let ext = "bin";
            if (mimeType.includes("pdf")) ext = "pdf";
            else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
            else if (mimeType.includes("png")) ext = "png";
            else if (mimeType.includes("gif")) ext = "gif";
            else if (mimeType.includes("webp")) ext = "webp";
            
            const fileName = `upload_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            
            await fs.writeFile(filePath, buffer);
            
            const port = process.env.PORT || 5000;
            // Provide a full localhost URL so the database stores a complete HTTP link
            const secure_url = `http://localhost:${port}/uploads/${fileName}`;
            
            return {
                secure_url
            };
        }
    }
};

export default cloudinary;
