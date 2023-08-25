import mongoose, { Document, Schema, Model } from "mongoose";
import Section from "./sectionsModel";

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
    required: [true, "A project must have a background"],
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
      required: [true, "A project must be associated with at least one user"],
    },
  ],
  ordered_sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
});

projectSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const project = this;

    // Delete sections associated with the project
    await Section.deleteMany({ project: project._id });

    next();
  }
);

const Project: Model<IProject> = mongoose.model<IProject>(
  "Project",
  projectSchema
);

export default Project;
