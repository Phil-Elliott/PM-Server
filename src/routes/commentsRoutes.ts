import express from "express";
import * as commentController from "../controllers/commentsController";

const router = express.Router();

router
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createComment);

router
  .route("/:id")
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
