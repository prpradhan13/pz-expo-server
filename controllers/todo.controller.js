import Todo from "../models/todo.model.js";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 });

export const createTodo = async (req, res) => {
  try {
    const { userId } = req?.auth;
    const { title, dueDate, completed, priority, tasks } = req.body;

    const savedTodo = await Todo.create({
      userId,
      title,
      dueDate,
      completed,
      priority,
      tasks,
    });

    const cacheKey = `todos_${userId}`;
    cache.del(cacheKey);

    res.status(201).json({
      success: true,
      message: "Todo saved successfully",
      savedTodo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while creating todo",
      error: error.message,
    });
  }
};

export const getTodo = async (req, res) => {
  try {
    const { userId } = req?.auth;
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cacheKey = `todos_${userId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Serving todos from cache for user: ${userId}`);
      return res.status(200).json({
        success: true,
        message: "Todos retrieved from cache successfully",
        todos: cachedData,
      });
    }

    const todos = await Todo.find({ userId });

    if (!todos || todos.length === 0) {
      console.log("No Todos found for this user: ", userId);
      
      return res.status(400).json({
        success: false,
        message: "No todos found for this user",
      });
    }

    cache.set(cacheKey, todos);

    res.status(200).json({
      success: true,
      message: `total ${todos?.length} todos`,
      todos,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while getting todo",
      error: error.message,
    });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
    const { title, dueDate, priority, tasks } = req.body;

    if (!title && !dueDate && !priority && (!tasks || tasks.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // Prepare update fields
    const updateFields = {};

    // Only add the fields that are provided
    if (title) updateFields.title = title;
    if (dueDate) updateFields.dueDate = dueDate;
    if (priority) updateFields.priority = priority;

    // If tasks are provided, handle the addition of new tasks
    if (tasks && tasks.length > 0) {
      updateFields.$push = { tasks: { $each: tasks } };
    }

    // Update the todo item
    const updatedTodo = await Todo.findByIdAndUpdate(todoId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    const { userId } = req?.auth;
    const cacheKey = `todos_${userId}`;
    cache.del(cacheKey);

    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      todoData: updatedTodo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating todo",
      error: error.message,
    });
  }
};

export const updateTodoTask = async (req, res) => {
  try {
    const { todoId } = req.params;
    const { taskId, taskTitle, completed } = req.body;

    // Check if taskId and either taskTitle or completed status are provided
    if (!taskId || (!taskTitle && completed === undefined)) {
      return res.status(400).json({
        success: false,
        message:
          "Task ID and at least one field (taskTitle or completed) are required",
      });
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, "tasks._id": taskId },
      {
        $set: {
          ...(taskTitle && { "tasks.$.tasktitle": taskTitle }),
          ...(completed !== undefined && { "tasks.$.completed": completed }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        message: "Todo or task not found",
      });
    }

    const { userId } = req?.auth;
    const cacheKey = `todos_${userId}`;
    cache.del(cacheKey);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      todoData: updatedTodo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating task",
      error: error.message,
    });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { userId } = req?.auth;
    await Todo.findByIdAndDelete(req.params.todoId);

    const cacheKey = `todos_${userId}`;
    cache.del(cacheKey);

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting todo",
      error: error.message,
    });
  }
};

export const deleteTodoTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Find the todo containing this task and update it by removing the task from the tasks array
    const updatedTodo = await Todo.findOneAndUpdate(
      { "tasks._id": taskId }, // Find the todo containing the task by task ID
      { $pull: { tasks: { _id: taskId } } }, // Remove the task with matching taskId from the tasks array
      { new: true } // Return the updated document
    );

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const { userId } = req?.auth;
    const cacheKey = `todos_${userId}`;
    cache.del(cacheKey);

    // Check if the tasks array is empty after deletion
    if (updatedTodo.tasks.length === 0) {
      await Todo.findByIdAndDelete(updatedTodo._id);

      return res.status(200).json({
        success: true,
        message: "Todo deleted because it has no tasks left",
      });
    }

    cache.del(cacheKey);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting todo",
      error: error.message,
    });
  }
};
