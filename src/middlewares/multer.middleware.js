import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //request body doesnot handle files and i.e. why actually multer is used 
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname )
  }//what is the name of the file which will be stored in files 
})

export const upload = multer({ 
  storage: storage 
})