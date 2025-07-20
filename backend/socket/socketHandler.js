import User from "../models/User.js"

export const handleSocketConnection = async (socket, io) => {
  console.log(`User ${socket.user.username} connected`)

  // Update user online status
  await User.findByIdAndUpdate(socket.user._id, {
    isOnline: true,
    lastSeen: new Date(),
  })

  // Broadcast user online status
  socket.broadcast.emit("userOnline", {
    userId: socket.user._id,
    username: socket.user.username,
  })

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log(`User ${socket.user.username} disconnected`)

    // Update user offline status
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    })

    // Broadcast user offline status
    socket.broadcast.emit("userOffline", {
      userId: socket.user._id,
      username: socket.user.username,
    })
  })

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.broadcast.emit("userTyping", {
      userId: socket.user._id,
      username: socket.user.username,
      taskId: data.taskId,
    })
  })

  socket.on("stopTyping", (data) => {
    socket.broadcast.emit("userStoppedTyping", {
      userId: socket.user._id,
      taskId: data.taskId,
    })
  })
}
