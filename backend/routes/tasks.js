import express from "express"
import Task from "../models/Task.js"
import User from "../models/User.js"
import ActionLog from "../models/ActionLog.js"
import { authenticateToken } from "../middleware/auth.js"
import { io } from "../server.js"

const router = express.Router()

// Get all tasks
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .populate("editedBy", "username email")
      .sort({ createdAt: -1 })

    res.json({ tasks })
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({ message: "Server error fetching tasks" })
  }
})

// Create task
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body

    if (!title) {
      return res.status(400).json({ message: "Title is required" })
    }

    const taskData = {
      title,
      description,
      priority,
      createdBy: req.user._id,
    }

    if (assignedTo) {
      taskData.assignedTo = assignedTo
    }

    const task = new Task(taskData)
    await task.save()

    await task.populate(["assignedTo", "createdBy"])

    // Log action
    await new ActionLog({
      action: "create",
      taskId: task._id,
      userId: req.user._id,
      details: { title, assignedTo },
    }).save()

    // Emit to all connected clients
    io.emit("taskCreated", task)

    res.status(201).json({ task })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Task title must be unique" })
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message })
    }
    console.error("Create task error:", error)
    res.status(500).json({ message: "Server error creating task" })
  }
})

// Update task
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const { conflictResolution, version } = updates

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check for conflicts
    if (version && task.version !== version && !conflictResolution) {
      return res.status(409).json({
        message: "Conflict detected",
        currentTask: await Task.findById(id).populate(["assignedTo", "createdBy", "editedBy"]),
        conflict: true,
      })
    }

    // Handle conflict resolution
    if (conflictResolution === "overwrite") {
      // Allow overwrite
    } else if (conflictResolution === "merge") {
      // Simple merge strategy - keep non-empty values
      Object.keys(updates).forEach((key) => {
        if (key !== "conflictResolution" && key !== "version") {
          if (updates[key] && updates[key] !== "") {
            task[key] = updates[key]
          }
        }
      })
      task.version += 1
      await task.save()
      await task.populate(["assignedTo", "createdBy", "editedBy"])

      // Log action
      await new ActionLog({
        action: "update",
        taskId: task._id,
        userId: req.user._id,
        details: { type: "merge", updates },
      }).save()

      io.emit("taskUpdated", task)
      return res.json({ task })
    }

    // Normal update
    const oldStatus = task.status
    Object.keys(updates).forEach((key) => {
      if (key !== "conflictResolution" && key !== "version") {
        task[key] = updates[key]
      }
    })

    task.version += 1
    task.isBeingEdited = false
    task.editedBy = null
    task.editStartTime = null

    await task.save()
    await task.populate(["assignedTo", "createdBy", "editedBy"])

    // Log action
    const actionType = oldStatus !== task.status ? "move" : "update"
    await new ActionLog({
      action: actionType,
      taskId: task._id,
      userId: req.user._id,
      details: {
        oldStatus,
        newStatus: task.status,
        updates,
      },
    }).save()

    io.emit("taskUpdated", task)
    res.json({ task })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Task title must be unique" })
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message })
    }
    console.error("Update task error:", error)
    res.status(500).json({ message: "Server error updating task" })
  }
})

// Delete task
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    await Task.findByIdAndDelete(id)

    // Log action
    await new ActionLog({
      action: "delete",
      taskId: task._id,
      userId: req.user._id,
      details: { title: task.title },
    }).save()

    io.emit("taskDeleted", { taskId: id })
    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    res.status(500).json({ message: "Server error deleting task" })
  }
})

// Smart assign task
router.post("/:id/smart-assign", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Get all users and their active task counts
    const users = await User.find({}, "_id username")
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const activeTaskCount = await Task.countDocuments({
          assignedTo: user._id,
          status: { $in: ["Todo", "In Progress"] },
        })
        return { user, activeTaskCount }
      }),
    )

    // Find user with fewest active tasks
    const userWithFewestTasks = userTaskCounts.reduce((min, current) =>
      current.activeTaskCount < min.activeTaskCount ? current : min,
    )

    // Assign task
    task.assignedTo = userWithFewestTasks.user._id
    task.version += 1
    await task.save()
    await task.populate(["assignedTo", "createdBy", "editedBy"])

    // Log action
    await new ActionLog({
      action: "smart_assign",
      taskId: task._id,
      userId: req.user._id,
      details: {
        assignedTo: userWithFewestTasks.user.username,
        taskCount: userWithFewestTasks.activeTaskCount,
      },
    }).save()

    io.emit("taskUpdated", task)
    res.json({ task })
  } catch (error) {
    console.error("Smart assign error:", error)
    res.status(500).json({ message: "Server error during smart assign" })
  }
})

// Start editing task
router.post("/:id/start-edit", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if already being edited
    if (task.isBeingEdited && task.editedBy.toString() !== req.user._id.toString()) {
      const editor = await User.findById(task.editedBy)
      return res.status(409).json({
        message: `Task is being edited by ${editor.username}`,
        isBeingEdited: true,
        editedBy: editor.username,
      })
    }

    task.isBeingEdited = true
    task.editedBy = req.user._id
    task.editStartTime = new Date()
    await task.save()

    io.emit("taskEditStarted", { taskId: id, editedBy: req.user.username })
    res.json({ message: "Edit session started" })
  } catch (error) {
    console.error("Start edit error:", error)
    res.status(500).json({ message: "Server error starting edit" })
  }
})

// End editing task
router.post("/:id/end-edit", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    task.isBeingEdited = false
    task.editedBy = null
    task.editStartTime = null
    await task.save()

    io.emit("taskEditEnded", { taskId: id })
    res.json({ message: "Edit session ended" })
  } catch (error) {
    console.error("End edit error:", error)
    res.status(500).json({ message: "Server error ending edit" })
  }
})

export default router
