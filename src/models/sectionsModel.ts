import mongoose, { Document, Schema, Model } from "mongoose";

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
    required: true,
  },
  ordered_tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

const Section: Model<ISection> = mongoose.model<ISection>(
  "Section",
  sectionSchema
);

export default Section;
