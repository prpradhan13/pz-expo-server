import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['need', 'emi', 'personal', 'investment'], // Enum for fixed categories
        lowercase: true
    },
    date: {
        type: Date,
        default: Date.now  // Automatically set to current date
    }
}, {timestamps: true});

export default mongoose.model('Expense', expenseSchema);