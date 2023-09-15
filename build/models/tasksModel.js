"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const taskSchema = new mongoose_1.Schema({
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
        enum: ["Low", "Normal", "high", "High", "Urgent"],
        default: "Normal",
    },
    due: Date,
    project: {
        type: mongoose_1.Schema.ObjectId,
        ref: "Project",
        required: [true, "Task must belong to a Project."],
    },
    section: {
        type: mongoose_1.Schema.ObjectId,
        ref: "Section",
    },
    comments: [
        {
            type: mongoose_1.Schema.ObjectId,
            ref: "Comment",
        },
    ],
    assigned_users: [
        {
            type: mongoose_1.Schema.ObjectId,
            ref: "User",
        },
    ],
    watching_users: [
        {
            type: mongoose_1.Schema.ObjectId,
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
const Task = mongoose_1.default.model("Task", taskSchema);
exports.default = Task;
