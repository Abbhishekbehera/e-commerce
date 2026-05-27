import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config({
    // path: "../.env",
    quiet: true
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadImageToCloudinary = async (localFilePath) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(
            localFilePath,
            { resource_type: "auto" }
        );

        await fs.promises.unlink(localFilePath);
        console.log("url:", uploadResult.url);
        return uploadResult;
    } catch (error) {
        throw error;
    }
};

export { uploadImageToCloudinary };
