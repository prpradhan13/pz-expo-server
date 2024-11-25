import express from 'express';
import { requireAuth } from '@clerk/express';
import { createExpense, deleteExpense, updateExpense, userAllExpenses } from '../controllers/expense.controller.js';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config({
  path: './.env'
})

router
  .route("/")
  .post(createExpense)
  .get(userAllExpenses);

router
  .route("/:expenseId")
  .put(updateExpense)
  .delete(deleteExpense);

export default router;