import Expense from "../models/expense.model.js";
import NodeCache from "node-cache";

// Initialize the cache with a default TTL of 600 seconds (10 minutes)
const cache = new NodeCache({ stdTTL: 600 });

export const createExpense = async (req, res) => {
  try {
    const expensesData = req.body;
    const { userId } = req.auth;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const cacheKey = `expenses_${userId}`;

    if (!Array.isArray(expensesData)) {
      const { item, price, category, date } = expensesData;

      if (!item || !price || !category) {
        return res.status(400).json({
          success: false,
          message: "All fields (item, price, category) are required",
        });
      }

      const expense = await Expense.create({
        userId,
        item: item.toLowerCase(),
        price,
        category: category.toLowerCase(),
        date: date ? new Date(date) : new Date(),
      });

      cache.del(cacheKey);

      console.log("Createed: ", expense);

      return res.status(200).json({
        success: true,
        message: "Expense created successfully",
        expense,
      });
    }

    // Handle multiple expenses
    const formattedExpenses = expensesData.map((exp) => ({
      userId,
      item: exp.item,
      price: exp.price,
      category: exp.category,
      date: exp.date ? new Date(exp.date) : new Date(),
    }));

    // Validate if required fields are present in every expense object
    for (let exp of formattedExpenses) {
      if (!exp.item || !exp.price || !exp.category) {
        return res.status(400).json({
          success: false,
          message:
            "All fields (item, price, category) are required for every expense",
        });
      }
    }

    const createdExpenses = await Expense.insertMany(formattedExpenses);

    cache.del(cacheKey);

    return res.status(200).json({
      success: true,
      message: "Expenses created successfully",
      expenses: createdExpenses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while creating Expense",
      error: error.message,
    });
  }
};

export const userAllExpenses = async (req, res) => {
  try {
    const { userId } = req?.auth;
    // console.log("userAllExpenses", userId);

    const { limit, page, sortBy = "date", order = "desc" } = req.query;

    const cacheKey = `expenses_${userId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Serving Expense data from cache for ${userId}`);
      return res.status(200).json({
        success: true,
        message: "Expenses retrieved from cache successfully",
        expenseData: cache.get(cacheKey),
      });
    }

    const limitNumber = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNumber;

    const expenses = await Expense.find({ userId })
      .select("-userId -createdAt -updatedAt -__v")
      .sort({ [sortBy]: order === "desc" ? 1 : -1 })
      .skip(skip)
      .limit(limitNumber);

    if (!expenses || expenses.length === 0) {
      console.log("No expenses found for this user: ", userId);
      
      return res.status(400).json({
        success: false,
        message: "No expenses found for this user",
      });
    }

    cache.set(cacheKey, expenses);

    res.status(200).json({
      success: true,
      message: "Expenses retrieved successfully",
      userId,
      totalExpense: expenses.length,
      expenseData: expenses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while getting all Expense",
      error: error.message,
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { item, price, category, date } = req.body;

    if (!item && !price && !category && !date) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (item, price, category, or date) is required to update",
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        $set: {
          ...(item && { item }),
          ...(price && { price }),
          ...(category && { category }),
          ...(date && { date: new Date(date) }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Use user-specific cache key
    const { userId } = req.auth;
    const cacheKey = `expenses_${userId}`;
    cache.del(cacheKey);

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating an Expense",
      error: error.message,
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { userId } = req?.auth;

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const cacheKey = `expenses_${userId}`;
    cache.del(cacheKey);

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating an Expense",
      error: error.message,
    });
  }
};
