import mongoose from "mongoose"

const actionLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "assign", "move", "smart_assign"],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying of recent actions
actionLogSchema.index({ timestamp: -1 })

export default mongoose.model("ActionLog", actionLogSchema)
