"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("./models/userModel"));
const projectModel_1 = __importDefault(require("./models/projectModel"));
const sectionsModel_1 = __importDefault(require("./models/sectionsModel"));
const tasksModel_1 = __importDefault(require("./models/tasksModel"));
const commentsModel_1 = __importDefault(require("./models/commentsModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../config.env") });
const DB = (_a = process.env.DATABASE) === null || _a === void 0 ? void 0 : _a.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// Check for required environment variables
if (!process.env.DATABASE_PASSWORD || !DB) {
    console.error("Missing required environment variables");
    process.exit(1);
}
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default
        .connect(DB, {
        useUnifiedTopology: true,
    })
        .then(() => console.log("DB connection successful!"))
        .catch((err) => {
        console.error("DB connection error:", err);
        process.exit(1);
    });
    const demoUser = yield userModel_1.default.findOne({ email: "user@gmail.com" });
    if (demoUser) {
        const projects = yield projectModel_1.default.find({ users: demoUser._id }).populate("sections");
        for (const project of projects) {
            // Loop through each section and manually call deleteOne
            for (const sectionId of project.sections) {
                const section = yield sectionsModel_1.default.findById(sectionId).populate("ordered_tasks");
                if (section) {
                    // Loop through each task and delete associated comments
                    for (const taskId of section.ordered_tasks) {
                        const task = yield tasksModel_1.default.findById(taskId);
                        if (task) {
                            // Loop through each comment and manually call deleteOne
                            for (const commentId of task.comments) {
                                yield commentsModel_1.default.findByIdAndDelete(commentId);
                            }
                            yield task.deleteOne();
                        }
                    }
                    yield section.deleteOne();
                }
            }
            // Now delete the project
            yield project.deleteOne();
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
                background: "https://timely-lollipop-f90b7b.netlify.app/assets/flowers.8b253557.jpg",
            },
            {
                title: "Product Launch",
                users: [
                    demoUser._id,
                    "6503bc37b6f88a7b9543ae40",
                    "6503bc5cb6f88a7b9543ae49",
                    "6503bc11b6f88a7b9543ae37",
                ],
                background: "https://timely-lollipop-f90b7b.netlify.app/assets/mountains.c9ac7a2f.jpg",
            },
            {
                title: "Employee Onboarding",
                users: [
                    demoUser._id,
                    "6503bc37b6f88a7b9543ae40",
                    "6503bc5cb6f88a7b9543ae49",
                    "6503bc11b6f88a7b9543ae37",
                ],
                background: "https://timely-lollipop-f90b7b.netlify.app/assets/nightSky.9a6aed7c.jpg",
            },
        ];
        for (const pInfo of projectInfo) {
            // Create a new project
            const project = new projectModel_1.default({
                title: pInfo.title,
                users: pInfo.users,
                background: pInfo.background,
            });
            yield project.save();
            // Section names
            const sectionNames = ["Planning", "Development", "Launch"];
            for (const name of sectionNames) {
                // Create a new section
                const section = new sectionsModel_1.default({
                    title: name,
                    project: project._id,
                });
                yield section.save();
                // Task titles and descriptions
                const taskDetails = {
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
                                    users_permissions_user: new mongoose_1.default.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
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
                            description: "Estimate time and resources needed for the project.",
                            priority: "Normal",
                            due: new Date("2023-10-31"),
                            assigned_users: [demoUser._id, "6503bc37b6f88a7b9543ae40"],
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
                                new mongoose_1.default.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
                            ],
                            comments: [
                                {
                                    content: "Let's start the research next week.",
                                    users_permissions_user: demoUser._id,
                                    createdAt: new Date("2023-09-14T11:00:00"),
                                },
                                {
                                    content: "Please collect all the necessary materials.",
                                    users_permissions_user: new mongoose_1.default.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
                                    createdAt: new Date("2023-09-14T12:00:00"),
                                },
                                {
                                    content: "I have a few more ideas on how to do this.",
                                    users_permissions_user: new mongoose_1.default.Types.ObjectId("6503bc5cb6f88a7b9543ae49"),
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
                                new mongoose_1.default.Types.ObjectId("6503bc37b6f88a7b9543ae40"),
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
                                new mongoose_1.default.Types.ObjectId("6503bc5cb6f88a7b9543ae49"),
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
                    const task = new tasksModel_1.default({
                        title: taskDetail.title,
                        description: taskDetail.description,
                        priority: taskDetail.priority,
                        due: taskDetail.due,
                        project: project._id,
                        section: section._id,
                        watching_users: taskDetail.watching_users,
                        assigned_users: taskDetail.assigned_users,
                    });
                    yield task.save();
                    // Create comments if they exist in the task detail and associate them with the task
                    const comments = [];
                    if (taskDetail.comments) {
                        for (const commentDetail of taskDetail.comments) {
                            const comment = new commentsModel_1.default({
                                content: commentDetail.content,
                                task: task._id,
                                project: project._id,
                                users_permissions_user: commentDetail.users_permissions_user,
                                createdAt: commentDetail.createdAt,
                            });
                            yield comment.save();
                            comments.push(comment._id);
                        }
                    }
                    // Update the task with the new comments
                    task.comments = comments;
                    yield task.save();
                    // Update section with the new task
                    section.ordered_tasks.push(task._id);
                }
                // Save the updated section
                yield section.save();
                // Update project with the new section
                project.sections.push(section._id);
                project.ordered_sections.push(section._id);
            }
            // Save the updated project
            yield project.save();
        }
    }
    mongoose_1.default.connection.close();
});
seedData().then(() => {
    console.log("Seed data inserted");
});
