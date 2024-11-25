import mongoose from 'mongoose';

const weeklyTraining = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    trainingName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    week: [
        {
            weekNumber: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                trim: true,
                maxlength: 100
            },
            days: [
                {
                    dayNumber: {
                        type: Number,
                        required: true
                    },
                    name: {
                        type: String,
                        trim: true,
                        maxlength: 100
                    },
                    isRestDay: {
                        type: Boolean,
                        default: false
                    },
                    workoutPlan: [
                        {
                            exerciseName: {
                                type: String,
                                trim: true,
                                required: true,
                                maxlength: 100
                            },
                            sets: [
                                {
                                    repetitions: {
                                        type: Number,
                                        default: 0
                                    }
                                }
                            ],
                            restTime: {
                                type: Number,
                                default: 0 // Rest time in seconds
                            }
                        }
                    ]
                }
            ]
        }
    ]
}, {timestamps: true});

export default mongoose.model('WeeklyTraining', weeklyTraining);