import express from "express";
import * as sectionsController from "../controllers/sectionsController";

const router = express.Router();

// Define routes for sections
router
  .route("/")
  .get(sectionsController.getAllSections) // Get all sections
  .post(sectionsController.createSection); // Create a new section

router
  .route("/:sectionId")
  .get(sectionsController.getSection) // Get section by ID
  .patch(sectionsController.updateSection) // Update section by ID
  .delete(sectionsController.deleteSection); // Delete section by ID

export default router;
