import express from "express";
import customerController from "../controllers/customerController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import * as validate from '../middlewares/validate.js'
import * as customerSchema from '../schemas/customerSchema.js'
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin", "staff"),
  validate.validateQuery(customerSchema.getAllCustomerQuery),
  customerController.getAllCustomer
);
router.get(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(customerSchema.paramsId),
  customerController.getCustomerById
);
router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validate.validateBody(customerSchema.createCustomerSchema),
  customerController.createCustomer
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(customerSchema.paramsId),
  validate.validateBody(customerSchema.updateCustomerSchema),
  customerController.updateCustomer
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validate.validateParams(customerSchema.paramsId),
  customerController.deleteCustomer
);

export default router;
