import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProject extends Document {
  title: string;
  background: string;
  tasks: mongoose.Types.ObjectId[];
  sections: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  users: mongoose.Types.ObjectId[];
  ordered_sections: mongoose.Types.ObjectId[];
}

const projectSchema = new Schema({
  title: {
    type: String,
    required: [true, "A project must have a title"],
    trim: true,
    maxlength: [
      100,
      "A project title must have less or equal than 100 characters",
    ],
    minlength: [1, "A project title must have more or equal than 1 character"],
  },
  background: {
    type: String,
    trim: true,
  },
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  ordered_sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
});

const Project = (Model<IProject> = mongoose.model<IProject>(
  "Project",
  projectSchema
));

export default Project;
