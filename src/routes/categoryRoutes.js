import express from "express";
import categoryController from "../controllers/categoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import * as validate from "../middlewares/validate.js";
import * as categorySchema from "../schemas/categorySchema.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin"),
  validate.validateQuery(categorySchema.getAllCategoryQuery),
  categoryController.getAllCategory
);
router.get(
  "/:id",
  authMiddleware,
  authorize("admin", "staff"),
  validate.validateParams(categorySchema.paramsId),
  categoryController.getCategoryById
);
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validate.validateBody(categorySchema.createCategorySchema),
  categoryController.createCategory
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(categorySchema.paramsId),
  validate.validateBody(categorySchema.updateCategorySchema),
  categoryController.updateCategory
  
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(categorySchema.paramsId),
  categoryController.deleteCategory
);

export default router;
