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
const commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: [true, "A comment must have content"],
        trim: true,
        maxlength: [500, "A comment must have less or equal than 500 characters"],
        minlength: [1, "A comment must have more or equal than 1 character"],
    },
    task: {
        type: mongoose_1.Schema.ObjectId,
        ref: "Task",
        required: [true, "Comment must belong to a task."],
    },
    project: {
        type: mongoose_1.Schema.ObjectId,
        ref: "Project",
        required: [true, "Comment must belong to a project."],
    },
    users_permissions_user: {
        type: mongoose_1.Schema.ObjectId,
        ref: "User",
        required: [true, "Comment must belong to a user."],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    publishedAt: Date,
});
const Comment = mongoose_1.default.model("Comment", commentSchema);
exports.default = Comment;
