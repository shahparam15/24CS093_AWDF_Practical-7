import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      validate: {
        validator: function (val) {
          return typeof val === "string" && val.trim().length > 0;
        },
        message: "Task title cannot be empty or whitespace only.",
      },
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be either 'low', 'medium', or 'high'. Received: '{VALUE}'.",
      },
      default: "medium",
      lowercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must belong to an authenticated user."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Pre-save hook: Trim whitespace from title
taskSchema.pre("save", function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

export const Task = mongoose.model("Task", taskSchema);
export default Task;
