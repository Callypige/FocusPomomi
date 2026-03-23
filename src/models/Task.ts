import { Schema, model, models } from "mongoose";

const TaskSchema = new Schema({
  title: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "failed"],
    default: "pending",
  },
  fruit: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

// Prevent model recompilation on hot reload
export const TaskModel = models.Task || model("Task", TaskSchema);
