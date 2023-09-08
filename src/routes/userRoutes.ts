import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  getUserByEmail,
} from "../controllers/userController";
import { protect, restrictTo } from "../controllers/authController";

const router = express.Router();

router.use(protect);

router.get("/me", getMe, getUserById);

router.route("/updateMe").patch(updateMe);

router.route("/deleteMe").delete(deleteMe);

router.get("/getUserByEmail/:email", getUserByEmail);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers);

router.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
