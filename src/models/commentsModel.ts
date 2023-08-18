import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "A comment must have content"],
    trim: true,
    maxlength: [500, "A comment must have less or equal than 500 characters"],
    minlength: [1, "A comment must have more or equal than 1 character"],
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: "Task", // Make sure this string matches your task model name
    required: [true, "Comment must belong to a task."],
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project", // Make sure this string matches your project model name
    required: [true, "Comment must belong to a project."],
  },
  users_permissions_user: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // Make sure this string matches your user model name
    required: [true, "Comment must belong to a user."],
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
