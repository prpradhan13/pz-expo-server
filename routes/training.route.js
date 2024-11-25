import express from "express";
import { allPublicTrainingData, createTraining, deleteTraining, getTraining, updatePublicField } from "../controllers/training.controller.js";
import { createWeeklyTraining, getWeeklyTraining } from "../controllers/weeklyTraining.controller.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.route("/").post(createTraining).get(getTraining);
router.route("/public").get(allPublicTrainingData);

router.route("/:trainingId").delete(deleteTraining).patch(updatePublicField);

router.route("/weeklyTraining").post(createWeeklyTraining).get(getWeeklyTraining);

export default router;