import mongoose from "mongoose";

export const commentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide a unique email"],
    unique: true,
  },
  name: { type: String },
  message: { type: String },
});

export default mongoose.model.Comments ||
  mongoose.model("Comment", commentSchema);
