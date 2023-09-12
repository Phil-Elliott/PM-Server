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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController = __importStar(require("../controllers/projectController"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.use(authController_1.protect);
router
    .route("/")
    .get(projectController.getAllProjects) // Fetch all projects
    .post(projectController.createProject); // Create a new project
router
    .route("/:id")
    .get(projectController.getProject) // Fetch a single project by ID
    .patch(projectController.updateProject) // Update a project by ID
    .delete(projectController.deleteProject); // Delete a project by ID
router
    .route("/:id/ordered-sections")
    .patch(projectController.updateSectionOrder); // Update section order of a project by ID
router.route("/:id/add-user").patch(projectController.addUserToProject); // Add a user to a project by ID
exports.default = router;
