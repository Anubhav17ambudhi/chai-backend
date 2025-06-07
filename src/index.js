// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
  path: './env'
})
connectDB()





/*
import express from "express"
const app = express()

//multiple iffe creates problem so we use the semicolor in front of it
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(error) => {
      console.log("Err",error);
      throw error 
    })

    app.listen(process.env.PORT, () =>{
      console.log(`App is listening on PORT ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("Error: ",error)
    throw error
  }
})()
  */