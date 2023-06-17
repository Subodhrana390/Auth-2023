import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

/** auth middleware */
export default async function Auth(req, res, next) {
  // access authorize header to validate request

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = await jwt.verify(token, "goodboy");
    req.user = decodedToken;
    next();
  } catch (error) {
    res.send("Authentication failed");
  }
}

export function localVariables(req, res, next) {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}

// https://ethereal.email/create
let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "abe.abernathy52@ethereal.email",
    pass: "KdhfqQXQST6VtyZ6NQ",
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  // body of the email
  var email = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to Daily Tuition! We're very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);

  let message = {
    from: "abe.abernathy52@ethereal.email",
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  // send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res
        .status(200)
        .send({ msg: "You should receive an email from us." });
    })
    .catch((error) => res.status(500).send({ error }));
};
