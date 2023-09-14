import mongoose from "mongoose";
import User, { IUser } from "./models/userModel";
import Project, { IProject } from "./models/projectModel";
import Section, { ISection } from "./models/sectionsModel";
import Task, { ITask } from "./models/tasksModel";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

const DB: string | undefined = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD!
);

// Check for required environment variables
if (!process.env.DATABASE_PASSWORD || !DB) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const seedData = async () => {
  await mongoose
    .connect(DB, {
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions)
    .then(() => console.log("DB connection successful!"))
    .catch((err) => {
      console.error("DB connection error:", err);
      process.exit(1);
    });

  const demoUser = await User.findOne({ email: "user@gmail.com" });

  if (demoUser) {
    const projects = await Project.find({ users: demoUser._id }).populate(
      "sections"
    );

    for (const project of projects) {
      // Loop through each section and manually call deleteOne
      for (const sectionId of project.sections) {
        const section = await Section.findById(sectionId);
        if (section) {
          await section.deleteOne();
        } else {
        }
      }

      // Now delete the project
      await project.deleteOne();
    }

    // first project to create
    const project1: IProject = new Project({
      title: "Website Redesign",
      users: [demoUser._id],
      background:
        "https://timely-lollipop-f90b7b.netlify.app/assets/flowers.8b253557.jpg",
    });
    await project1.save();

    const task11: ITask = new Task({
      title: "Task 1",
      project: project1._id,
    });
    await task11.save();

    const section11: ISection = new Section({
      title: "Planning",
      project: project1._id,
      ordered_tasks: [task11._id],
      order: 1,
    });
    await section11.save();

    task11.section = section11._id;
    await task11.save();

    project1.sections.push(section11._id);
    project1.ordered_sections.push(section11._id);
    await project1.save();

    // second project to create
    const project2: IProject = new Project({
      title: "Product Launch",
      users: [demoUser._id],
      background:
        "https://timely-lollipop-f90b7b.netlify.app/assets/mountains.c9ac7a2f.jpg",
    });
    await project2.save();

    const task21: ITask = new Task({
      title: "Task 1",
      project: project2._id,
    });
    await task21.save();

    const section21: ISection = new Section({
      title: "Planning",
      project: project2._id,
      ordered_tasks: [task21._id],
      order: 2,
    });
    await section21.save();

    task21.section = section21._id;
    await task21.save();

    project2.sections.push(section21._id);
    project2.ordered_sections.push(section21._id);
    await project2.save();

    // third project to create
    const project3: IProject = new Project({
      title: "Employee Onboarding",
      users: [demoUser._id],
      background:
        "https://timely-lollipop-f90b7b.netlify.app/assets/nightSky.9a6aed7c.jpg",
    });
    await project3.save();

    const task31: ITask = new Task({
      title: "Task 1",
      project: project3._id,
    });
    await task31.save();

    const section31: ISection = new Section({
      title: "Planning",
      project: project3._id,
      ordered_tasks: [task31._id],
      order: 1,
    });
    await section31.save();

    task31.section = section31._id;
    await task31.save();

    project3.sections.push(section31._id);
    project3.ordered_sections.push(section31._id);
    await project3.save();
  }

  mongoose.connection.close();
};

seedData().then(() => {
  console.log("Seed data inserted");
});
