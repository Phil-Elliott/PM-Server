import mongoose, { Document, Schema, Model } from "mongoose";
import Task from "./tasksModel";

export interface ISection extends Document {
  title: string;
  project: mongoose.Types.ObjectId;
  tasks: mongoose.Types.ObjectId[];
  order: number;
  ordered_tasks: mongoose.Types.ObjectId[];
}

const sectionSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project", // Assuming you named your project model as 'Project'
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Assuming you named your task model as 'Task'
    },
  ],
  order: {
    type: Number,
  },
  ordered_tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

sectionSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const section = this;

    // Delete tasks associated with this section
    await Task.deleteMany({ section: section._id });

    next();
  }
);

const Section: Model<ISection> = mongoose.model<ISection>(
  "Section",
  sectionSchema
);

export default Section;
