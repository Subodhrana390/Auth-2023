import UserModel from "../models/user.js";
import CommentModel from "../models/comment.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

/** middleware for verify user */
export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
  try {
    const {
      username,
      password,
      profile,
      email,
      firstName,
      lastName,
      mobile,
      address,
    } = req.body;

    let existUsername = await UserModel.findOne({ username });
    if (existUsername)
      return res.status(404).send({ error: "username already exist!" });

    let existEmail = await UserModel.findOne({ email });
    if (existEmail)
      return res.status(404).send({ error: "email already exist!" });

    if (!password) {
      return res.status(404).send({ error: "Password is reqiured!" });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const user = new UserModel({
            username,
            password: hashedPassword,
            profile: profile || "",
            email,
            firstName,
            lastName,
            mobile,
            address,
          });
          user
            .save()
            .then((result) =>
              res.status(201).send({ msg: "User Register Successfully" })
            )
            .catch((error) => res.status(500).send({ error }));
        })
        .catch((error) => {
          return res.status(500).send({
            error: "Enable to hashed password",
          });
        });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    UserModel.findOne({ username })
      .then((user) => {
        bcrypt
          .compare(password, user.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({ error: "Don't have Password" });

            // create jwt token
            const token = jwt.sign(
              {
                userId: user._id,
                username: user.username,
              },
              "goodboy",
              { expiresIn: "24h" }
            );

            return res.status(200).send({
              msg: "Login Successful...!",
              username: user.username,
              token,
            });
          })
          .catch((error) => {
            return res.status(400).send({ error: "Password does not Match" });
          });
      })
      .catch((error) => {
        return res.status(404).send({ error: "Username not Found" });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    UserModel.findOne({ username })
      .then((user) => {
        if (!user)
          return res.status(501).send({ error: "Couldn't Find the User" });

        const { password, ...rest } = Object.assign({}, user.toJSON());
        return res.status(201).send(rest);
      })
      .catch((error) => {
        return res.status(500).send({ err });
      });
  } catch (error) {
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
}
/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
  try {
    const { userId } = req.user;

    if (userId) {
      const body = req.body;

      // update the data
      UserModel.updateOne({ _id: userId }, body)
        .then((err, data) => {
          return res.status(201).send({ msg: "Record Updated...!" });
        })
        .catch((error) => {
          return res.status(401).send({ error: "Not Updated" });
        });
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;

    try {
      UserModel.findOne({ username })
        .then((user) => {
          bcrypt.hash(password, 10).then((hashedPassword) => {
            UserModel.updateOne(
              { username: user.username },
              { password: hashedPassword }
            )
              .then((data) => {
                req.app.locals.resetSession = false; // reset session
                return res.status(201).send({ msg: "Record Updated...!" });
              })
              .catch((err) => {
                return res.status(500).send({ err });
              });
          });
        })
        .catch((e) => {
          return res.status(500).send({
            error: "Enable to hashed password",
          });
        });
    } catch (error) {
      return res.status(401).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getSubscribe(req, res) {
  try {
    const { userId } = req.user;

    if (userId) {
      const { name, email, message } = req.body;

      // update the data
      UserModel.findOne({ _id: userId }).then(() => {
        const comment = new CommentModel({
          name,
          email,
          message,
        });
        comment
          .save()
          .then((result) =>
            res.status(201).send({ msg: "User comment Successfully" })
          )
          .catch((error) => res.status(500).send({ error }));
      });
    } else {
      return res.status(401).send({ error: "User Not Found...!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}