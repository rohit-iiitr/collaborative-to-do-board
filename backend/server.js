import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/database.js"
import authRoutes from "./routes/auth.js"
import taskRoutes from "./routes/tasks.js"
import actionRoutes from "./routes/actions.js"
import { authenticateSocket } from "./middleware/auth.js"
import { handleSocketConnection } from "./socket/socketHandler.js"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "https://collaborative-to-do-board-1.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: "https://collaborative-to-do-board-1.onrender.com",
    credentials: true,
  }),
)
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/actions", actionRoutes)

// Socket.IO middleware and connection handling
io.use(authenticateSocket)
io.on("connection", (socket) => handleSocketConnection(socket, io))

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { io }
