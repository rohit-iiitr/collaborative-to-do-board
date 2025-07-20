import express from "express"
import ActionLog from "../models/ActionLog.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get recent actions
router.get("/", authenticateToken, async (req, res) => {
  try {
    const actions = await ActionLog.find()
      .populate("userId", "username")
      .populate("taskId", "title")
      .sort({ timestamp: -1 })
      .limit(20)

    res.json({ actions })
  } catch (error) {
    console.error("Get actions error:", error)
    res.status(500).json({ message: "Server error fetching actions" })
  }
})

export default router
