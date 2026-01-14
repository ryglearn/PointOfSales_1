import express from "express";
import productController from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import * as validate from '../middlewares/validate.js'
import * as productSchema from '../schemas/productSchema.js'
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin", "staff"),
  validate.validateQuery(productSchema.getAllProductQuery),
  productController.getAllproduct
);
router.get(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(productSchema.paramsId),
  productController.getproductById
);
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validate.validateBody(productSchema.createProductSchema),
  productController.createproduct
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(productSchema.paramsId),
  validate.validateBody(productSchema.updateProductSchema),
  productController.updateproduct
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(productSchema.paramsId),
  productController.deleteproduct
);

export default router;
