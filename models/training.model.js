import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    trainingName: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        maxlength: 100
    },
    category: {
        type: String,
        required: true,
        enum:[
            "high intensity",
            "cardio",
            "cutting",
            "gaining",
            "abdominal(abs)",
            "beginner",
            "intermediate",
            "advance",
        ],
        lowercase: true,
    },
    trainingPlan: [
        {
            exerciseName: {
                type: String,
                trim: true,
                required: true,
                maxlength: 100
            },
            sets: [{ repetitions: {type: Number, default:0} }],
            restTime: {
                type: Number,
                default: 0
            }
        }
    ],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

export default mongoose.model('Training', trainingSchema);