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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const sectionsModel_1 = __importDefault(require("./sectionsModel"));
const projectSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    sections: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Section",
        },
    ],
    comments: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    users: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "A project must be associated with at least one user"],
        },
    ],
    ordered_sections: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Section",
        },
    ],
});
projectSchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = this;
        // Delete sections associated with the project
        yield sectionsModel_1.default.deleteMany({ project: project._id });
        next();
    });
});
const Project = mongoose_1.default.model("Project", projectSchema);
exports.default = Project;
