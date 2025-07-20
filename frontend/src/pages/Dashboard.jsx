"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketContext"
import Header from "../components/Header"
import KanbanBoard from "../components/KanbanBoard"
import ActivityLog from "../components/ActivityLog"
import TaskModal from "../components/TaskModal"
import ConflictModal from "../components/ConflictModal"
import { taskAPI, actionAPI } from "../services/api"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [actions, setActions] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [conflictData, setConflictData] = useState(null)
  const [showActivityLog, setShowActivityLog] = useState(false)

  const { user } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on("taskCreated", handleTaskCreated)
      socket.on("taskUpdated", handleTaskUpdated)
      socket.on("taskDeleted", handleTaskDeleted)
      socket.on("taskEditStarted", handleTaskEditStarted)
      socket.on("taskEditEnded", handleTaskEditEnded)

      return () => {
        socket.off("taskCreated")
        socket.off("taskUpdated")
        socket.off("taskDeleted")
        socket.off("taskEditStarted")
        socket.off("taskEditEnded")
      }
    }
  }, [socket])

  const loadInitialData = async () => {
    try {
      const [tasksRes, actionsRes, usersRes] = await Promise.all([
        taskAPI.getTasks(),
        actionAPI.getActions(),
        taskAPI.getUsers(),
      ])

      setTasks(tasksRes.data.tasks)
      setActions(actionsRes.data.actions)
      setUsers(usersRes.data.users)
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev])
    loadActions()
  }

  const handleTaskUpdated = (task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)))
    loadActions()
  }

  const handleTaskDeleted = ({ taskId }) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId))
    loadActions()
  }

  const handleTaskEditStarted = ({ taskId, editedBy }) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, isBeingEdited: true, editedBy: { username: editedBy } } : t)),
    )
  }

  const handleTaskEditEnded = ({ taskId }) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, isBeingEdited: false, editedBy: null } : t)))
  }

  const loadActions = async () => {
    try {
      const response = await actionAPI.getActions()
      setActions(response.data.actions)
    } catch (error) {
      console.error("Error loading actions:", error)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        const response = await taskAPI.updateTask(editingTask._id, {
          ...taskData,
          version: editingTask.version,
        })

        if (response.data.conflict) {
          setConflictData({
            currentTask: response.data.currentTask,
            newData: taskData,
            taskId: editingTask._id,
          })
          return
        }
      } else {
        await taskAPI.createTask(taskData)
      }

      setShowTaskModal(false)
      setEditingTask(null)
    } catch (error) {
      if (error.response?.status === 409) {
        setConflictData({
          currentTask: error.response.data.currentTask,
          newData: taskData,
          taskId: editingTask._id,
        })
      } else {
        console.error("Error submitting task:", error)
        alert(error.response?.data?.message || "Error submitting task")
      }
    }
  }

  const handleConflictResolve = async (resolution, taskId, newData) => {
    try {
      await taskAPI.updateTask(taskId, {
        ...newData,
        conflictResolution: resolution,
      })

      setConflictData(null)
      setShowTaskModal(false)
      setEditingTask(null)
    } catch (error) {
      console.error("Error resolving conflict:", error)
      alert("Error resolving conflict")
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.deleteTask(taskId)
      } catch (error) {
        console.error("Error deleting task:", error)
        alert("Error deleting task")
      }
    }
  }

  const handleSmartAssign = async (taskId) => {
    try {
      await taskAPI.smartAssign(taskId)
    } catch (error) {
      console.error("Error with smart assign:", error)
      alert("Error with smart assign")
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t._id === taskId)
      await taskAPI.updateTask(taskId, {
        status: newStatus,
        version: task.version,
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      alert("Error updating task status")
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <Header
        user={user}
        onCreateTask={handleCreateTask}
        onToggleActivityLog={() => setShowActivityLog(!showActivityLog)}
        showActivityLog={showActivityLog}
      />

      <div className="dashboard-content">
        <div className={`main-content ${showActivityLog ? "with-sidebar" : ""}`}>
          <KanbanBoard
            tasks={tasks}
            users={users}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onSmartAssign={handleSmartAssign}
            onStatusChange={handleStatusChange}
          />
        </div>

        {showActivityLog && (
          <div className="sidebar">
            <ActivityLog actions={actions} />
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onSubmit={handleTaskSubmit}
          onClose={() => {
            setShowTaskModal(false)
            setEditingTask(null)
          }}
        />
      )}

      {conflictData && (
        <ConflictModal
          conflictData={conflictData}
          onResolve={handleConflictResolve}
          onClose={() => setConflictData(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
