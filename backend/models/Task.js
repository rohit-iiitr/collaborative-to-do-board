import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isBeingEdited: {
      type: Boolean,
      default: false,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    editStartTime: {
      type: Date,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure task titles are unique
taskSchema.index({ title: 1 }, { unique: true })

// Validate that title doesn't match column names
taskSchema.pre("save", function (next) {
  const columnNames = ["Todo", "In Progress", "Done"]
  if (columnNames.includes(this.title)) {
    const error = new Error("Task title cannot match column names (Todo, In Progress, Done)")
    error.name = "ValidationError"
    return next(error)
  }
  next()
})

export default mongoose.model("Task", taskSchema)
