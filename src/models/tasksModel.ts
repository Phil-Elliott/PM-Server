import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  priority: string;
  due: Date;
  project: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  comments: mongoose.Types.ObjectId[];
  assigned_users: mongoose.Types.ObjectId[];
  watching_users: mongoose.Types.ObjectId[];
  order: number;
}

const taskSchema = new Schema({
  title: {
    type: String,
    required: [true, "A task must have a title"],
    trim: true,
    maxlength: [
      100,
      "A task title must have less or equal than 100 characters",
    ],
    minlength: [1, "A task title must have more or equal than 1 character"],
  },
  description: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  due: Date,
  project: {
    type: Schema.ObjectId,
    ref: "Project",
    required: [true, "Task must belong to a Project."],
  },
  section: {
    type: Schema.ObjectId,
    ref: "Section",
  },
  comments: [
    {
      type: Schema.ObjectId,
      ref: "Comment",
    },
  ],
  assigned_users: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  watching_users: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  order: Number,
});

// Virtual populate: To get the number of comments or users without having to actually populate them
taskSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

taskSchema.virtual("assignedUsersCount").get(function () {
  return this.assigned_users.length;
});

taskSchema.virtual("watchingUsersCount").get(function () {
  return this.watching_users.length;
});

const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
export default Task;
