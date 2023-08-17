import express from "express";
import * as projectController from "../controllers/projectController";

const router = express.Router();

// Protect all routes after this middleware (for authenticated users only, for example)
// router.use(protect);

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
