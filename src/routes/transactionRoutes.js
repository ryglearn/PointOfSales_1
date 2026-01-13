import express from "express";
import transactionController from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import * as validate from '../middlewares/validate.js'
import * as transactionSchema from '../schemas/transactionSchema.js'
const router = express.Router();

router.get(
  "/reports",
  authMiddleware,
  authorize("admin"),
  validate.validateQuery(transactionSchema.transactionReportQuery),
  transactionController.transactionReport
);
router.get(
  "/",
  authMiddleware,
  authorize("staff"),
  validate.validateQuery(transactionSchema.getAllTransactionQuery),
  transactionController.getAllTransaction
);
router.get(
  "/:id",
  authMiddleware,
  authorize("staff"),
  validate.validateParams(transactionSchema.paramsId),
  transactionController.getTransactionById
);
router.post(
  "/",
  authMiddleware,
  authorize("staff"),
  validate.validateBody(transactionSchema.createTransactionSchema),
  transactionController.createTransaction
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("staff"),
  validate.validateParams(transactionSchema.paramsId),
  transactionController.deleteTransaction
);

export default router;
