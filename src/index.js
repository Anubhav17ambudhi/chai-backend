// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
  path: './env'
})
connectDB()
.then(() => {
  app.on("error",(error) => {
      console.log("Err",error);
      throw error 
    })
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`)
  })
})
.catch((err) => {
  console.log("MONGODB connection failed !!!",err);
})




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