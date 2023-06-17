import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import AuthRoute from "./routes/user.js";

dotenv.config();

const connect = async () => {
  await mongoose
    .connect(
      "mongodb+srv://subodhrana390:admin@cluster0.05lh1jt.mongodb.net/",
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};

const app = express();
const port = 8000;

app.use(express.json());
app.use("/api", AuthRoute);

app.listen(port, () => {
  connect();
  console.log(`app is running on http://localhost:${port}`);
});
