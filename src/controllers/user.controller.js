import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//generate access and refresh tokens by this methods wherever necessary
const generateAccessandRefreshTokens = async function(userId){
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})// we have to do this otherwise the //mogoDB asks for 
    //passwords and all and we don't want that
    
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token");
  }
}


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

const loginUser = asyncHandler(async(req,res) => {
  //login user todos
  //username or email
  //find the user
  //password check
  // access and refresh token
  // send cookies

  const {email,password,username}  = req.body

  if(!username && !email){
    throw new ApiError(400,"Username or email is required");
  }

  const user = await User.findOne({
    $or: [{username},{email}]//based on username or email query is done
  })

  if(!user){
    throw new ApiError(404,"User doesnot Exists");
  }

  // await User //not User this the user for the mongoDB mongoose methods are accessed via this User
  // when we generated methods in our into the user that we created 

  const isPasswordvalid = await user.isPasswordCorrect(password);

  if(!isPasswordvalid){
    throw new ApiError(401,"Invalid User credentials");
  }

  //now we have to create access and refresh tokens so we create a method to make these easily
  const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id)

  //now we have to send this to the cookies of the client
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,//this makes sure that the cookies are not modifiable using the frontend
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,accessToken,refreshToken//this is for the user to user these tokens if required
      },
      "User logged in successfully"
    )
  )
})

const logoutUser = asyncHandler(async(req,res) => {
   await User.findByIdAndUpdate(
    req.user._id,
    {//this is the updated code
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
   )

   const options = {
    httpOnly: true,//this makes sure that the cookies are not modifiable using the frontend
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200, {},"User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized Request")
  }

  try {
    const decodedToken = jwt.verify(refreshAccessToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken,newrefreshToken} = await generateAccessandRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newrefreshToken},
        "Access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
  const {oldPassword, newPassword} = req.body

  const user = User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid Password");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return  res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"));
})

const getCurrentUser = asyncHandler( async(req,res) => {
  return res
  .status(200)
  .json(200,req.user,"Current User fetched successfully");
})

const updateAccountDetails = asyncHandler(async(req,res) => {
  const {fullname,email,} = req.body//always to update files we must keep different end points for example changing avatar Image

  if(!fullname || !email){
    throw new ApiError(400,"All fields are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        fullname,
        email: email
      }
    },
    {new: true} 
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Avatar image updated successfully"));
})

const updateCoverImage = asyncHandler(async(req,res) => {
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400,"CoverImage file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading on coverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"CoverImage updated successfully"));
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage
} 