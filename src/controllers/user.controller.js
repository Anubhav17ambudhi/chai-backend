import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async(req,res) => {
  // steps for registering the user from on the server
  // first step is taking necessary details from the user from postman(frontend)
  //validaion - not empty
  // checking in database that if it is a already existing user in the database: by username or email
  // otherwise add this user to the database and move with the information
  //check for images,check for avatar upload on cloudinary again check on the cloudinary
  // create user object - create entry in DB
  //remove password and refresh token field from response
  //check for user creation if user created return response

  const {fullname,email,username,password} = req.body
  // console.log(req.body);
  // console.log(req.files);
  // console.log("email: ",email)

  if (
    [fullname,email,username,password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400,"All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{username},{email}]
  })

  if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //this gives error because req.files has coverImage or not we don't and we don't handle as that in
  //avatar image
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is Required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"Avatar is Required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
  )
})

export {registerUser} 