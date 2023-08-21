import express from "express";
import * as projectController from "../controllers/projectController";
import { protect } from "../controllers/authController";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(projectController.getAllProjects) // Fetch all projects
  .post(projectController.createProject); // Create a new project

router
  .route("/:id")
  .get(projectController.getProject) // Fetch a single project by ID
  .patch(projectController.updateProject) // Update a project by ID
  .delete(projectController.deleteProject); // Delete a project by ID

export default router;
