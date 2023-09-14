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
        // await Project.deleteMany({ users: demoUser._id });
        // await Section.deleteMany({ userId: demoUser._id });
        // await Task.deleteMany({ userId: demoUser._id });
        const projects = yield projectModel_1.default.find({ users: demoUser._id }).populate("sections");
        console.log(projects);
        for (const project of projects) {
            // Loop through each section and manually call deleteOne
            for (const sectionId of project.sections) {
                const section = yield sectionsModel_1.default.findById(sectionId);
                if (section) {
                    console.log("Deleting section", section.title);
                    yield section.deleteOne();
                }
                else {
                    console.log("Section not found");
                }
            }
            // Now delete the project
            yield project.deleteOne();
        }
        // first project to create
        const project1 = new projectModel_1.default({
            title: "Website Redesign",
            users: [demoUser._id],
            background: "https://timely-lollipop-f90b7b.netlify.app/assets/flowers.8b253557.jpg",
        });
        yield project1.save();
        const task11 = new tasksModel_1.default({
            title: "Task 1",
            project: project1._id,
        });
        yield task11.save();
        const section11 = new sectionsModel_1.default({
            title: "Planning",
            project: project1._id,
            ordered_tasks: [task11._id],
            order: 1,
        });
        yield section11.save();
        task11.section = section11._id;
        yield task11.save();
        project1.sections.push(section11._id);
        project1.ordered_sections.push(section11._id);
        yield project1.save();
        // await Project.findByIdAndUpdate(project1._id, {
        //   $push: {
        //     sections: section11._id,
        //     ordered_sections: section11._id,
        //   },
        // });
        // second project to create
        const project2 = new projectModel_1.default({
            title: "Product Launch",
            users: [demoUser._id],
            background: "https://timely-lollipop-f90b7b.netlify.app/assets/mountains.c9ac7a2f.jpg",
        });
        yield project2.save();
        const task21 = new tasksModel_1.default({
            title: "Task 1",
            project: project2._id,
        });
        yield task21.save();
        const section21 = new sectionsModel_1.default({
            title: "Planning",
            project: project2._id,
            ordered_tasks: [task21._id],
            order: 2,
        });
        yield section21.save();
        task21.section = section21._id;
        yield task21.save();
        project2.sections.push(section21._id);
        project2.ordered_sections.push(section21._id);
        yield project2.save();
        // await Project.findByIdAndUpdate(project2._id, {
        //   $push: {
        //     sections: section21._id,
        //     ordered_sections: section21._id,
        //   },
        // });
        // third project to create
        const project3 = new projectModel_1.default({
            title: "Employee Onboarding",
            users: [demoUser._id],
            background: "https://timely-lollipop-f90b7b.netlify.app/assets/nightSky.9a6aed7c.jpg",
        });
        yield project3.save();
        const task31 = new tasksModel_1.default({
            title: "Task 1",
            project: project3._id,
        });
        yield task31.save();
        const section31 = new sectionsModel_1.default({
            title: "Planning",
            project: project3._id,
            ordered_tasks: [task31._id],
            order: 1,
        });
        yield section31.save();
        task31.section = section31._id;
        yield task31.save();
        project3.sections.push(section31._id);
        project3.ordered_sections.push(section31._id);
        yield project3.save();
        // await Project.findByIdAndUpdate(project3._id, {
        //   $push: {
        //     sections: section31._id,
        //     ordered_sections: section31._id,
        //   },
        // });
    }
    mongoose_1.default.connection.close();
});
seedData().then(() => {
    console.log("Seed data inserted");
});
