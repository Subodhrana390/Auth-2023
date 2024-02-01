import express from "express";
const router = express.Router();

/** import all controller */
import * as controller from "../controller/user_controller.js";
import Auth, {
  localVariables,
  registerMail,
} from "../controller/middleware.js";

/** POST Methods */
router.post("/register", controller.register); // register user
router.route("/registerMail").post(registerMail); // send the email
router.post("/authenticate", controller.verifyUser, (req, res) => res.end()); // authenticate user
router.post("/login", controller.verifyUser, controller.login); // login in app

/** GET Methods */
router.get("/user/:username", controller.getUser); // user with username
router.get(
  "/generateOTP",
  controller.verifyUser,
  localVariables,
  controller.generateOTP
); // generate random OTP
router.get("/verifyOTP", controller.verifyUser, controller.verifyOTP); // verify generated OTP
router.get("/createResetSession", controller.createResetSession); // reset all the variables

/** PUT Methods */
router.put("/updateuser", Auth, controller.updateUser); // is use to update the user profile// is use to update the user profile
router.post("/createComment", Auth, controller.getSubscribe); // is use to update the user profile// is use to update the user profile
router.put("/resetPassword", controller.verifyUser, controller.resetPassword); // use to reset password

export default router;
