import express from "express";
import * as sectionsController from "../controllers/sectionsController";

const router = express.Router();

router
  .route("/")
  .get(sectionsController.getAllSections) // Get all sections
  .post(sectionsController.createSection); // Create a new section

router
  .route("/:id")
  .get(sectionsController.getSection) // Get section by ID
  .patch(sectionsController.updateSection) // Update section by ID
  .delete(sectionsController.deleteSection); // Delete section by ID

router.route("/:id/ordered-tasks").patch(sectionsController.updateOrderedTasks); // Update section's ordered_tasks array

export default router;
