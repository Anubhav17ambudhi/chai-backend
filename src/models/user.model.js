import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true//to make anything very easily searchable
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String,//cloudinary ulr comes herre,
    required: true
  },
  coverImage: {
    type: String,//cloudinary url
  },
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  password: {
    type: String,
    required: [true,"Password is Required"]
  },
  refreshToken: {
    type: String
  }
},
{
 timestamps: true
}
)

// userSchema.pre("save",() => {})don't write a call back function because we have to use this 
//because we want to use same context here otherwise this is not gonna work

userSchema.pre("save",async function (next){
  if(!this.isModified("password")) return next();

  this.password = bcrypt.hash(this.password, 10)
  next()
})//password encrypt logic

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password)//returns true and false that is why we use
  //return 
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },//this is only the payload of the token which will be generated else all from donenv
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },//this is only the payload of the token which will be generated else all from donenv
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User",userSchema);

