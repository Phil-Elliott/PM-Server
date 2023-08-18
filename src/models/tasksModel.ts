import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
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
    enum: ["low", "medium", "high"], // you can adjust this enum as per your priority values
  },
  due: Date,
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
    required: [true, "Task must belong to a Project."],
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: "Section",
  },
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
  ],
  assigned_users: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  watching_users: [
    {
      type: mongoose.Schema.ObjectId,
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

const Task = mongoose.model("Task", taskSchema);

export default Task;
