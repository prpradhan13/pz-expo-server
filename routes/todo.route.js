import express from "express";
import { requireAuth } from '@clerk/express';
import { createTodo, deleteTodo, deleteTodoTask, getTodo, updateTodo, updateTodoTask } from "../controllers/todo.controller.js";

const router = express.Router();

router.route("/").post(createTodo).get(getTodo);

router
  .route("/:todoId")
  .put(updateTodo)
  .patch(updateTodoTask)
  .delete(deleteTodo);

router.route("/task/:taskId").delete(deleteTodoTask);

export default router;