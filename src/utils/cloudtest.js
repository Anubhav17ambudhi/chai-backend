//this is for the purpose to just check whether the main file
//cloudinary.js function uploadOnCloudinary works fine or not
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("No file path provided");
      return null;
    }

    const absolutePath = path.resolve(localFilePath);
    console.log("Trying to upload file:", absolutePath);

    if (!fs.existsSync(absolutePath)) {
      console.error("File does NOT exist at path:", absolutePath);
      return null;
    }

    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto"
    });

    console.log("✅ File uploaded on Cloudinary:", response.secure_url);
    return response;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return null;
  }
};

const image = "./public/temp/av.jpg";
uploadOnCloudinary(image);

export { uploadOnCloudinary };
