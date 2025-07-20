import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import "../styles/KanbanBoard.css";

const columns = [
  { id: "Todo", title: "Todo", color: "#426ec5ff", textColor: "#ffffff" },
  {
    id: "In Progress",
    title: "In Progress",
    color: "#426ec5ff",
    textColor: "#f0f0f0",
  },
  { id: "Done", title: "Done", color: "#426ec5ff", textColor: "#eeeeee" },
];

const KanbanBoard = ({
  tasks = [],
  users = [],
  onEditTask,
  onDeleteTask,
  onSmartAssign,
  onStatusChange,
}) => {
  // Always treat _id as string
  const safeTasks = Array.isArray(tasks)
    ? tasks.map((t) => ({ ...t, _id: String(t._id) }))
    : [];

  const getTasksByStatus = (status) =>
    safeTasks.filter((task) => task.status === status);

  const getTaskCount = (status) => getTasksByStatus(status).length;

  const getPriorityCount = (status, priority) =>
    getTasksByStatus(status).filter((task) => task.priority === priority)
      .length;

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    onStatusChange(draggableId, destination.droppableId);
  };

  return (
    <div className="kanban-board">
      <div className="board-header">
        <div className="board-stats">
          <div className="stat-item">
            <span className="stat-number">{safeTasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getTaskCount("Done")}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{getTaskCount("In Progress")}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column">
              <div
                className="column-header"
                style={{backgroundColor: column.color}}
              >
                <div className="column-title">
                  <h3 style={{ color: column.textColor }}>{column.title}</h3>
                  <span className="task-count" style={{ color: column.textColor }}>{getTaskCount(column.id)}</span>
                </div>
                <div className="priority-indicators">
                  <div
                    className="priority-dot high"
                    title={`${getPriorityCount(
                      column.id,
                      "High"
                    )} High Priority`}
                  >
                    {getPriorityCount(column.id, "High")}
                  </div>
                  <div
                    className="priority-dot medium"
                    title={`${getPriorityCount(
                      column.id,
                      "Medium"
                    )} Medium Priority`}
                  >
                    {getPriorityCount(column.id, "Medium")}
                  </div>
                  <div
                    className="priority-dot low"
                    title={`${getPriorityCount(column.id, "Low")} Low Priority`}
                  >
                    {getPriorityCount(column.id, "Low")}
                  </div>
                </div>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${
                      snapshot.isDraggingOver ? "drag-over" : ""
                    }`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-wrapper ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                          >
                            <TaskCard
                              task={task}
                              users={users}
                              onEdit={onEditTask}
                              onDelete={onDeleteTask}
                              onSmartAssign={onSmartAssign}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {getTasksByStatus(column.id).length === 0 && (
                      <div className="empty-column">
                        <div className="empty-icon">📝</div>
                        <p>No tasks in {column.title.toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
