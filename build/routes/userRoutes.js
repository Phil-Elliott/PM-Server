"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.use(authController_1.protect);
router.get("/me", userController_1.getMe, userController_1.getUserById);
router.route("/updateMe").patch(userController_1.updateMe);
router.route("/deleteMe").delete(userController_1.deleteMe);
router.get("/getUserByEmail/:email", userController_1.getUserByEmail);
router.use((0, authController_1.restrictTo)("admin"));
router.route("/").get(userController_1.getAllUsers);
router.route("/:id").get(userController_1.getUserById).patch(userController_1.updateUser).delete(userController_1.deleteUser);
exports.default = router;
