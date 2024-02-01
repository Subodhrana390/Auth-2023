import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import AuthRoute from "./routes/user.js";
import cors from "cors";

dotenv.config();

const connect = async () => {
  await mongoose
    .connect(
      "mongodb+srv://subodhrana390:pV4n27KEoRiHwhb7@cluster0.d7m19c0.mongodb.net/?retryWrites=true&w=majority",
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
app.use(cors());
app.use("/api", AuthRoute);

app.listen(port, () => {
  connect();
  console.log(`app is running on http://localhost:${port}`);
});
