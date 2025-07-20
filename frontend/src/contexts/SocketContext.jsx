"use client"

import { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { token, user } = useAuth()

  useEffect(() => {
    if (token && user) {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
      })

      newSocket.on("connect", () => {
        console.log("Connected to server")
        setSocket(newSocket)
      })

      newSocket.on("userOnline", (userData) => {
        setOnlineUsers((prev) => {
          const exists = prev.find((u) => u.userId === userData.userId)
          if (!exists) {
            return [...prev, userData]
          }
          return prev
        })
      })

      newSocket.on("userOffline", (userData) => {
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== userData.userId))
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server")
        setSocket(null)
      })

      return () => {
        newSocket.close()
      }
    }
  }, [token, user])

  const value = {
    socket,
    onlineUsers,
    isConnected: !!socket,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
