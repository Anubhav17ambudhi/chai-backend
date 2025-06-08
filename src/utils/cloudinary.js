import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config(
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
);//this helps to actually add files and all 

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath)return null
    //upload
    const response = await cloudinary.uploader.upload(localFilePath, {resource_type:"auto"});
    //file has been successfully uploaded
    console.log("File is uploaded on cloudinary",response);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload got failed
    return null;
  }
}


// cloudinary.v2.uploader.upload("https://up")

export {uploadOnCloudinary}