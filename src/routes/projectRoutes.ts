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

router
  .route("/:id/ordered-sections")
  .patch(projectController.updateSectionOrder); // Update section order of a project by ID

router.route("/:id/add-user").patch(projectController.addUserToProject); // Add a user to a project by ID

export default router;
