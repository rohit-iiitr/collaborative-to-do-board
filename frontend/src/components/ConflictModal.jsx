"use client"

import { useState } from "react"
import "../styles/ConflictModal.css"

const ConflictModal = ({ conflictData, onResolve, onClose }) => {
  const [selectedResolution, setSelectedResolution] = useState("")
  const [loading, setLoading] = useState(false)

  const { currentTask, newData, taskId } = conflictData

  const handleResolve = async () => {
    if (!selectedResolution) {
      alert("Please select a resolution method")
      return
    }

    setLoading(true)
    try {
      await onResolve(selectedResolution, taskId, newData)
    } catch (error) {
      console.error("Error resolving conflict:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getChangedFields = () => {
    const changes = []

    if (currentTask.title !== newData.title) {
      changes.push({
        field: "Title",
        current: currentTask.title,
        new: newData.title,
      })
    }

    if (currentTask.description !== newData.description) {
      changes.push({
        field: "Description",
        current: currentTask.description || "(empty)",
        new: newData.description || "(empty)",
      })
    }

    if (currentTask.priority !== newData.priority) {
      changes.push({
        field: "Priority",
        current: currentTask.priority,
        new: newData.priority,
      })
    }

    const currentAssignee = currentTask.assignedTo?.username || "Unassigned"
    const newAssignee = newData.assignedTo
      ? (typeof newData.assignedTo === "string" ? newData.assignedTo : newData.assignedTo.username) || "Unassigned"
      : "Unassigned"

    if (currentAssignee !== newAssignee) {
      changes.push({
        field: "Assigned To",
        current: currentAssignee,
        new: newAssignee,
      })
    }

    return changes
  }

  const changedFields = getChangedFields()

  return (
    <div className="modal-overlay conflict-overlay">
      <div className="modal-content conflict-modal">
        <div className="modal-header conflict-header">
          <div className="conflict-icon">⚠️</div>
          <div>
            <h2>Conflict Detected</h2>
            <p>This task was modified by another user while you were editing it.</p>
          </div>
        </div>

        <div className="conflict-content">
          <div className="conflict-info">
            <div className="task-info">
              <h3>Task: {currentTask.title}</h3>
              <p>Last updated: {formatDate(currentTask.updatedAt)}</p>
              <p>Version: {currentTask.version}</p>
            </div>
          </div>

          <div className="changes-comparison">
            <h4>Conflicting Changes:</h4>

            {changedFields.length === 0 ? (
              <p className="no-changes">No field conflicts detected.</p>
            ) : (
              <div className="changes-grid">
                {changedFields.map((change, index) => (
                  <div key={index} className="change-item">
                    <div className="field-name">{change.field}</div>
                    <div className="change-comparison">
                      <div className="current-value">
                        <label>Current (Server)</label>
                        <div className="value-box current">{change.current}</div>
                      </div>
                      <div className="arrow">→</div>
                      <div className="new-value">
                        <label>Your Changes</label>
                        <div className="value-box new">{change.new}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="resolution-options">
            <h4>How would you like to resolve this conflict?</h4>

            <div className="resolution-choice">
              <label className="resolution-option">
                <input
                  type="radio"
                  name="resolution"
                  value="overwrite"
                  checked={selectedResolution === "overwrite"}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-title">🔄 Overwrite</div>
                  <div className="option-description">
                    Replace the current version with your changes. This will discard any changes made by others.
                  </div>
                </div>
              </label>
            </div>

            <div className="resolution-choice">
              <label className="resolution-option">
                <input
                  type="radio"
                  name="resolution"
                  value="merge"
                  checked={selectedResolution === "merge"}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-title">🔀 Smart Merge</div>
                  <div className="option-description">
                    Attempt to merge your changes with the current version. Non-empty values from your changes will be
                    kept.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer conflict-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleResolve}
            disabled={loading || !selectedResolution}
          >
            {loading ? "Resolving..." : "Resolve Conflict"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
