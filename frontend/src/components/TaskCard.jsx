"use client"

import { useState } from "react"
import "../styles/TaskCard.css"

const TaskCard = ({ task, users, onEdit, onDelete, onSmartAssign }) => {
  const [showActions, setShowActions] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAssignedUser = () => {
    if (!task.assignedTo) return null
    return users.find((user) => user._id === task.assignedTo._id) || task.assignedTo
  }

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`
  }

  const assignedUser = getAssignedUser()

  return (
    <div
      className={`task-card ${task.isBeingEdited ? "being-edited" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {task.isBeingEdited && (
        <div className="editing-indicator">
          <span className="editing-text">✏️ Being edited by {task.editedBy?.username}</span>
        </div>
      )}

      <div className="task-header">
        <div className="task-priority">
          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
        </div>

        <div className={`task-actions ${showActions ? "visible" : ""}`}>
          <button className="action-btn smart-assign" onClick={() => onSmartAssign(task._id)} title="Smart Assign">
            🎯
          </button>
          <button className="action-btn edit" onClick={() => onEdit(task)} title="Edit Task">
            ✏️
          </button>
          <button className="action-btn delete" onClick={() => onDelete(task._id)} title="Delete Task">
            🗑️
          </button>
        </div>
      </div>

      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        {task.description && <p className="task-description">{task.description}</p>}
      </div>

      <div className="task-footer">
        <div className="task-meta">
          <div className="created-info">
            <span className="created-by">Created by {task.createdBy?.username}</span>
            <span className="created-date">{formatDate(task.createdAt)}</span>
          </div>
        </div>

        {assignedUser && (
          <div className="assigned-user">
            <div className="user-avatar" title={assignedUser.username}>
              {assignedUser.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{assignedUser.username}</span>
          </div>
        )}
      </div>

      <div className="task-version">v{task.version}</div>
    </div>
  )
}

export default TaskCard
