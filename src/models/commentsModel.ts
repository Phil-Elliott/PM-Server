import mongoose, { Document, Schema, Model } from "mongoose";

export interface IComment extends Document {
  content: string;
  task: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  users_permissions_user: mongoose.Types.ObjectId;
}

const commentSchema = new Schema({
  content: {
    type: String,
    required: [true, "A comment must have content"],
    trim: true,
    maxlength: [500, "A comment must have less or equal than 500 characters"],
    minlength: [1, "A comment must have more or equal than 1 character"],
  },
  task: {
    type: Schema.ObjectId,
    ref: "Task",
    required: [true, "Comment must belong to a task."],
  },
  project: {
    type: Schema.ObjectId,
    ref: "Project",
    required: [true, "Comment must belong to a project."],
  },
  users_permissions_user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "Comment must belong to a user."],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  publishedAt: Date,
});

const Comment: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);

export default Comment;
