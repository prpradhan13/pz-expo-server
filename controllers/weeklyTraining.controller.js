import NodeCache from "node-cache";
import WeeklyTraining from "../models/weeklyTraining.model.js";

// Initialize the cache with a default TTL of 600 seconds (10 minutes)
const cache = new NodeCache({ stdTTL: 600 });
const cacheKey = `weekly_training`;

export const createWeeklyTraining = async (req, res) => {
  try {
    const { userId } = req?.auth;
    const { trainingName, week } = req.body;

    console.log(userId, trainingName);

    // Basic validation (could be extended as needed)
    if (!userId || !trainingName || !week || week.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User ID, training name, and at least one week are required.",
      });
    }

    // Additional week structure validation
    for (const wk of week) {
      if (!wk.weekNumber || !wk.days || !wk.days.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Each week must have a week number and at least one day.",
        });
      }

      // Validate each day within the week
      for (const day of wk.days) {
        if (!day.dayNumber || !day.name) {
          return res.status(400).json({
            success: false,
            message: "Each day must have a day number and name.",
          });
        }

        // If not a rest day, validate workoutPlan
        if (
          !day.isRestDay &&
          (!day.workoutPlan || day.workoutPlan.length === 0)
        ) {
          return res.status(400).json({
            success: false,
            message: "Workout plan is required for non-rest days.",
          });
        }

        // Validate workout plan exercises (if applicable)
        for (const exercise of day.workoutPlan) {
          if (!exercise.exerciseName) {
            return res.status(400).json({
              success: false,
              message: "Exercise name is required for each workout.",
            });
          }
        }
      }
    }

    // Creating a new Weekly Training instance
    const newWeeklyTraining = new WeeklyTraining({
      userId,
      trainingName,
      week,
    });

    // Save to the database
    await newWeeklyTraining.save();

    // Check if cacheKey exists and then delete the cache
    cache.del(cacheKey);

    // Success response
    return res.status(201).json({
      success: true,
      message: "Weekly training plan created successfully!",
      data: newWeeklyTraining,
    });
  } catch (error) {
    console.error("Error creating weekly training plan:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getWeeklyTraining = async (req, res) => {
  try {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Serving from cache ${cacheKey}`);
      return res.status(200).json({
        success: true,
        message: "Weekly Training retrieved from cache successfully",
        weeklyPlan: cache.get(cacheKey),
      });
    }

    const weeklyTrainings = await WeeklyTraining.find({});

    if (weeklyTrainings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No weekly training plans found.",
      });
    }

    cache.set(cacheKey, weeklyTrainings);

    return res.status(200).json({
      success: true,
      message: "Weekly training plans found.",
      weeklyPlan: weeklyTrainings,
    });
  } catch (error) {
    console.error("Error fetching weekly training plans:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
