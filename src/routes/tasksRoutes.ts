import express from "express";
import * as taskController from "../controllers/tasksController";

const router = express.Router();

// For this example, assuming you'll use the RESTful routes naming convention

router
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

export default router;
