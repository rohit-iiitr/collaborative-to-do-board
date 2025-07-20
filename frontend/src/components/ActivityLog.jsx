"use client"

import { useEffect, useState } from "react"
import { useSocket } from "../contexts/SocketContext"
import "../styles/ActivityLog.css"

const ActivityLog = ({ actions }) => {
  const [localActions, setLocalActions] = useState(actions)
  const { socket } = useSocket()

  useEffect(() => {
    setLocalActions(actions)
  }, [actions])

  useEffect(() => {
    if (socket) {
      const handleNewAction = () => {
        // Actions will be updated through the parent component
        // This is just for real-time indicators
      }

      socket.on("actionLogged", handleNewAction)

      return () => {
        socket.off("actionLogged")
      }
    }
  }, [socket])

  const formatActionMessage = (action) => {
    const { action: actionType, userId, taskId, details, timestamp } = action
    const username = userId?.username || "Unknown User"
    const taskTitle = taskId?.title || "Unknown Task"

    switch (actionType) {
      case "create":
        return `${username} created task "${taskTitle}"`
      case "update":
        return `${username} updated task "${taskTitle}"`
      case "delete":
        return `${username} deleted task "${taskTitle}"`
      case "assign":
        return `${username} assigned task "${taskTitle}" to ${details.assignedTo || "someone"}`
      case "move":
        return `${username} moved "${taskTitle}" from ${details.oldStatus} to ${details.newStatus}`
      case "smart_assign":
        return `${username} used smart assign on "${taskTitle}" → assigned to ${details.assignedTo}`
      default:
        return `${username} performed ${actionType} on "${taskTitle}"`
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "create":
        return "➕"
      case "update":
        return "✏️"
      case "delete":
        return "🗑️"
      case "assign":
        return "👤"
      case "move":
        return "🔄"
      case "smart_assign":
        return "🎯"
      default:
        return "📝"
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType) {
      case "create":
        return "success"
      case "update":
        return "info"
      case "delete":
        return "danger"
      case "assign":
        return "primary"
      case "move":
        return "warning"
      case "smart_assign":
        return "special"
      default:
        return "default"
    }
  }

  return (
    <div className="activity-log">
      <div className="activity-header">
        <h3>📊 Recent Activity</h3>
        <span className="activity-count">{localActions.length} actions</span>
      </div>

      <div className="activity-list">
        {localActions.length === 0 ? (
          <div className="empty-activity">
            <div className="empty-icon">🔍</div>
            <p>No recent activity</p>
            <span>Actions will appear here as team members work</span>
          </div>
        ) : (
          localActions.map((action, index) => (
            <div
              key={action._id || index}
              className={`activity-item ${getActionColor(action.action)} fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="activity-icon">
                <span className="icon">{getActionIcon(action.action)}</span>
              </div>

              <div className="activity-content">
                <div className="activity-message">{formatActionMessage(action)}</div>
                <div className="activity-timestamp">{formatTimestamp(action.timestamp)}</div>
              </div>

              <div className="activity-badge">
                <span className={`badge ${getActionColor(action.action)}`}>{action.action}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {localActions.length > 0 && (
        <div className="activity-footer">
          <div className="activity-summary">
            <div className="summary-item">
              <span className="summary-number">{localActions.filter((a) => a.action === "create").length}</span>
              <span className="summary-label">Created</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{localActions.filter((a) => a.action === "update").length}</span>
              <span className="summary-label">Updated</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{localActions.filter((a) => a.action === "move").length}</span>
              <span className="summary-label">Moved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityLog
