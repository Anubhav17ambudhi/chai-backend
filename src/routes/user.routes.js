import  {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { now } from "mongoose";

const router = Router();

//we want to use multer in this so we have the multer middleware in this before registerUser
// router.route("/register").post(registerUser) this was previous one

// but now
router.route("/register").post(
  upload.fields([
    //two objects that is avatar and cover Image
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1//now after this we can send Image
    }
  ]),
  registerUser
)


export default router