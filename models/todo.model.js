import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"], // Priority levels
    default: "Medium",
  },
  tasks: [
    {
      tasktitle: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
}, {timestamps: true});

export default mongoose.model("Todo", todoSchema);
