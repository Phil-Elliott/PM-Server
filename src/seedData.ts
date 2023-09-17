import mongoose from "mongoose";
import User, { IUser } from "./models/userModel";
import Project, { IProject } from "./models/projectModel";
import Section, { ISection } from "./models/sectionsModel";
import Task, { ITask } from "./models/tasksModel";
import Comment, { IComment } from "./models/commentsModel";

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
        const section = await Section.findById(sectionId).populate(
          "ordered_tasks"
        );
        if (section) {
          // Loop through each task and delete associated comments
          for (const taskId of section.ordered_tasks) {
            const task = await Task.findById(taskId);
            if (task) {
              // Loop through each comment and manually call deleteOne
              for (const commentId of task.comments) {
                await Comment.findByIdAndDelete(commentId);
              }
              await task.deleteOne();
            }
          }
          await section.deleteOne();
        }
      }

      // Now delete the project
      await project.deleteOne();
    }
    // Project titles and background images
    const projectInfo = [
      {
        title: "Website Redesign",
        users: [
          demoUser._id,
          "6503bc37b6f88a7b9543ae40",
          "6503bc5cb6f88a7b9543ae49",
          "6503bc11b6f88a7b9543ae37",
        ],
        background:
          "https://res.cloudinary.com/djdxd5akb/image/upload/v1694903633/PM-App/backgrounds/scenicNight_gouxdc.jpg",
      },
      {
        title: "Product Launch",
        users: [
          demoUser._id,
          "6503bc37b6f88a7b9543ae40",
          "6503bc5cb6f88a7b9543ae49",
          "6503bc11b6f88a7b9543ae37",
        ],
        background:
          "https://res.cloudinary.com/djdxd5akb/image/upload/v1694903633/PM-App/backgrounds/nightSky_bhcwuc.jpg",
      },
      {
        title: "Employee Onboarding",
        users: [
          demoUser._id,
          "6503bc37b6f88a7b9543ae40",
          "6503bc5cb6f88a7b9543ae49",
          "6503bc11b6f88a7b9543ae37",
        ],
        background:
          "https://res.cloudinary.com/djdxd5akb/image/upload/v1694903632/PM-App/backgrounds/mountains_iew4p2.jpg",
      },
    ];

    for (const pInfo of projectInfo) {
      // Create a new project
      const project: IProject = new Project({
        title: pInfo.title,
        users: pInfo.users,
        background: pInfo.background,
      });
      await project.save();

      // Section names
      const sectionNames = ["Planning", "Development", "Launch"];

      for (const name of sectionNames) {
        // Create a new section
        const section: ISection = new Section({
          title: name,
          project: project._id,
        });
        await section.save();

        // Task titles and descriptions
        const taskDetails: {
          [key: string]: {
            title: string;
            description: string;
            priority: string;
            due?: Date;
            watching_users?: mongoose.Types.ObjectId[];
            assigned_users?: mongoose.Types.ObjectId[];
            comments?: {
              content: string;
              users_permissions_user?: mongoose.Types.ObjectId;
              createdAt?: Date;
            }[];
          }[];
        } = {
          Planning: [
            {
              title: "Initial Research",
              description: "Gather initial requirements and user stories.",
              priority: "Normal",
              due: new Date("2023-12-01"),
              watching_users: [demoUser._id],
              assigned_users: [demoUser._id],
              comments: [
                {
                  content: "Let's start the research next week.",
                  users_permissions_user: demoUser._id,
                  createdAt: new Date("2023-09-14T12:00:00"),
                },
                {
                  content: "Please collect all the necessary materials.",
                  users_permissions_user: new mongoose.Types.ObjectId(
                    "6503bc37b6f88a7b9543ae40"
                  ),
                  createdAt: new Date("2023-09-14T11:00:00"),
                },
              ],
            },
            {
              title: "Wireframing",
              description: "Design low-fidelity wireframes for the website.",
              priority: "Low",
              // due: new Date("2023-10-01"),
            },
            {
              title: "Estimations",
              description:
                "Estimate time and resources needed for the project.",
              priority: "Normal",
              due: new Date("2023-10-31"),
              assigned_users: [
                new mongoose.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
              ],
            },
            {
              title: "Tech Stack Selection",
              description: "Decide on the technologies to use for the project.",
              priority: "High",
              // due: new Date("2024-01-01"),
              watching_users: [demoUser._id],
            },
          ],
          Development: [
            {
              title: "Setup Repo",
              description: "Initialize Git repository and branch strategy.",
              priority: "Urgent",
              due: new Date("2024-03-11"),
              assigned_users: [
                new mongoose.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
              ],
              comments: [
                {
                  content: "Let's start the research next week.",
                  users_permissions_user: demoUser._id,
                  createdAt: new Date("2023-09-14T11:00:00"),
                },
                {
                  content: "Please collect all the necessary materials.",
                  users_permissions_user: new mongoose.Types.ObjectId(
                    "6503bc37b6f88a7b9543ae40"
                  ),
                  createdAt: new Date("2023-09-14T12:00:00"),
                },
                {
                  content: "I have a few more ideas on how to do this.",
                  users_permissions_user: new mongoose.Types.ObjectId(
                    "6503bc5cb6f88a7b9543ae49"
                  ),
                  createdAt: new Date("2023-09-15T10:00:00"),
                },
              ],
            },
            {
              title: "Frontend Coding",
              description: "Implement the frontend UI components.",
              priority: "High",
              // due: new Date("2024-07-23"),
              watching_users: [demoUser._id],
            },
            {
              title: "Backend API",
              description: "Develop backend API and controllers.",
              priority: "High",
              due: new Date("2024-04-18"),
            },
            {
              title: "Database Design",
              description: "Design and implement the database schema.",
              priority: "Normal",
              due: new Date("2024-10-07"),
              watching_users: [demoUser._id],
            },
          ],
          Launch: [
            {
              title: "QA Testing",
              description: "Conduct quality assurance testing of all features.",
              priority: "High",
              due: new Date("2024-05-03"),
              assigned_users: [
                new mongoose.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
              ],
            },
            {
              title: "Pre-Launch Review",
              description: "Conduct a final review before launching.",
              priority: "Normal",
              due: new Date("2024-08-27"),
              watching_users: [demoUser._id],
            },
            {
              title: "Go Live",
              description: "Deploy the website to the production server.",
              priority: "Urgent",
              // due: new Date("2024-07-23"),
              assigned_users: [
                new mongoose.Types.ObjectId("6503bc5cb6f88a7b9543ae49"),
                new mongoose.Types.ObjectId("6503bc11b6f88a7b9543ae37"),
                new mongoose.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
              ],
            },
            {
              title: "Post-Launch Monitoring",
              description: "Monitor system performance and user interactions.",
              priority: "Normal",
              due: new Date("2023-09-01"),
              watching_users: [demoUser._id],
            },
          ],
        };

        for (const taskDetail of taskDetails[name]) {
          // Create a new task
          const task: ITask = new Task({
            title: taskDetail.title,
            description: taskDetail.description,
            priority: taskDetail.priority,
            due: taskDetail.due,
            project: project._id,
            section: section._id,
            watching_users: taskDetail.watching_users,
            assigned_users: taskDetail.assigned_users,
          });
          await task.save();

          // Create comments if they exist in the task detail and associate them with the task
          const comments = [];
          if (taskDetail.comments) {
            for (const commentDetail of taskDetail.comments) {
              const comment: IComment = new Comment({
                content: commentDetail.content,
                task: task._id,
                project: project._id,
                users_permissions_user: commentDetail.users_permissions_user,
                createdAt: commentDetail.createdAt,
              });
              await comment.save();
              comments.push(comment._id);
            }
          }

          // Update the task with the new comments
          task.comments = comments;
          await task.save();

          // Update section with the new task
          section.ordered_tasks.push(task._id);
        }

        // Save the updated section
        await section.save();

        // Update project with the new section
        project.sections.push(section._id);
        project.ordered_sections.push(section._id);
      }

      // Save the updated project
      await project.save();
    }
  }

  mongoose.connection.close();
};

seedData().then(() => {
  console.log("Seed data inserted");
});
