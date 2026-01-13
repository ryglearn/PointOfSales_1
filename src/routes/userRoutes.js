import dotenv from "dotenv/config";
import express from "express";
import userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import * as validate from "../middlewares/validate.js";
import * as userSchema from "../schemas/userSchema.js";
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin"),
  validate.validateQuery(userSchema.getAllUserQuery),
  userController.getAllUser
);
router.get(
  "/:id",
  authMiddleware,
  authorize("admin"),
 validate.validateParams(userSchema.paramsId),
  userController.getUserById
);
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
 validate.validateBody(userSchema.createUserSchema),
  userController.createUser
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
 validate.validateParams(userSchema.paramsId),
 validate.validateBody(userSchema.updateUserSchema),
  userController.updateUser
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
 validate.validateParams(userSchema.paramsId),
  userController.deleteUser
);

export default router;
