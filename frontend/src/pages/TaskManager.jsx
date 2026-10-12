import { useState, useEffect, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import Auth from "./Auth";

function TaskManager({ currentUser, onLoginSuccess }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");

  // Deletion state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // 1. Fetch Tasks from Express + MongoDB for the authenticated user
  const loadTasks = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setFetchError(err.message);
      showToast("error", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [currentUser, loadTasks]);

  // If user is not authenticated, show authentication prompt
  if (!currentUser) {
    return (
      <div className="page-container task-manager-page auth-required-view">
        <section className="portfolio-section">
          <div className="section-container">
            <div className="section-header-block">
              <h2 className="section-heading">Authentication Required</h2>
              <p className="section-subtext">
                Task endpoints are strictly protected by JWT middleware. Please sign in or create an account to manage your private tasks.
              </p>
            </div>
            <Auth onLoginSuccess={onLoginSuccess} />
          </div>
        </section>
      </div>
    );
  }

  // 2. Create Task with Optimistic UI Update
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Task title is required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    // Optimistic temporary task
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      _id: tempId,
      title: trimmedTitle,
      description: description.trim(),
      priority,
      completed: false,
      user: currentUser.id,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Optimistically update UI
    setTasks((prev) => [optimisticTask, ...prev]);

    // Clear inputs immediately
    setTitle("");
    setDescription("");
    setPriority("medium");

    try {
      const created = await createTask({
        title: trimmedTitle,
        description: optimisticTask.description,
        priority,
        completed: false,
      });

      // Replace optimistic record with confirmed server document
      setTasks((prev) =>
        prev.map((t) => (t._id === tempId ? created : t))
      );
      showToast("success", `Task "${created.title}" saved to MongoDB!`);
    } catch (err) {
      // Roll back optimistic update on failure
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      setFormError(err.message);
      showToast("error", `Failed to save task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Toggle Task Completion
  const handleToggleComplete = async (task) => {
    const originalCompleted = task.completed;
    const newCompleted = !originalCompleted;

    // Optimistically update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: newCompleted } : t))
    );

    try {
      const updated = await updateTask(task._id, { completed: newCompleted });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? updated : t))
      );
      showToast(
        "info",
        `Task "${task.title}" marked as ${newCompleted ? "completed" : "pending"}.`
      );
    } catch (err) {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: originalCompleted } : t))
      );
      showToast("error", `Failed to update status: ${err.message}`);
    }
  };

  // 4. Start Editing Task
  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "medium");
  };

  // 5. Save Edited Task
  const handleSaveEdit = async (taskId) => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      showToast("error", "Task title cannot be empty.");
      return;
    }

    try {
      const updated = await updateTask(taskId, {
        title: trimmedTitle,
        description: editDescription.trim(),
        priority: editPriority,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? updated : t))
      );
      setEditingTaskId(null);
      showToast("success", "Task updated successfully in MongoDB!");
    } catch (err) {
      showToast("error", `Failed to update task: ${err.message}`);
    }
  };

  // 6. Delete Task Handler (Confirm Dialog)
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);

    try {
      await deleteTask(taskToDelete._id);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      showToast("success", `Task "${taskToDelete.title}" deleted from MongoDB.`);
    } catch (err) {
      showToast("error", `Failed to delete task: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="page-container task-manager-page">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}" from MongoDB?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isProcessing={isDeleting}
      />

      <section className="portfolio-section">
        <div className="section-container">
          <div className="section-header-block">
            <h2 className="section-heading">Full Stack Protected Task Manager</h2>
            <p className="section-subtext">
              Real-time CRUD operations connecting React to Express &amp; MongoDB via JWT Authentication Middleware.
            </p>

            <div className="auth-user-banner">
              <span className="auth-badge-icon">🔐</span>
              <span className="auth-badge-text">
                Signed in as: <strong>{currentUser.email}</strong>
              </span>
              <span className="auth-badge-tag">Bearer JWT Active</span>
            </div>
          </div>

          <div className="task-manager-layout">
            {/* Task Creation Form Card */}
            <div className="task-form-card">
              <h3 className="card-title">Add New Task</h3>
              <form onSubmit={handleCreateTask} className="task-form" noValidate>
                {formError && <div className="form-error-banner">{formError}</div>}

                <div className="form-group">
                  <label htmlFor="task-title" className="form-label">
                    Title <span className="required-star">*</span>
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="form-input"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-description" className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    id="task-description"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details or notes..."
                    className="form-input form-textarea"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-priority" className="form-label">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="form-input form-select"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="submit-task-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving to MongoDB..." : "➕ Create Task"}
                </button>
              </form>
            </div>

            {/* Task List Showcase Area */}
            <div className="task-list-card">
              <div className="task-list-header">
                <h3 className="card-title">
                  Your Personal Tasks ({tasks.length})
                </h3>
                <button
                  type="button"
                  onClick={loadTasks}
                  className="refresh-btn"
                  disabled={isLoading}
                  title="Reload from MongoDB"
                >
                  🔄 Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="task-loading-state">
                  <div className="loading-spinner"></div>
                  <p>Fetching authenticated tasks from MongoDB...</p>
                </div>
              ) : fetchError ? (
                <div className="task-error-state">
                  <p className="error-text">⚠️ {fetchError}</p>
                  <button type="button" onClick={loadTasks} className="retry-fetch-btn">
                    🔄 Retry Fetch
                  </button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="task-empty-state">
                  <p>You have no saved tasks yet. Create one on the left to test your private pipeline!</p>
                </div>
              ) : (
                <div className="tasks-container">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className={`task-item ${task.completed ? "task-completed" : ""} ${
                        task.isOptimistic ? "task-optimistic" : ""
                      }`}
                    >
                      {editingTaskId === task._id ? (
                        // Inline Editing Mode
                        <div className="task-edit-mode">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                            placeholder="Task title..."
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="edit-textarea"
                            placeholder="Description..."
                            rows="2"
                          />
                          <div className="edit-controls-row">
                            <select
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value)}
                              className="edit-select"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <div className="edit-buttons">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(task._id)}
                                className="save-edit-btn"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="cancel-edit-btn"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Standard View Mode
                        <div className="task-view-mode">
                          <div className="task-main-info">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task)}
                                aria-label={`Mark ${task.title} as ${
                                   task.completed ? "incomplete" : "complete"
                                }`}
                              />
                              <span className="checkmark"></span>
                            </label>

                            <div className="task-texts">
                              <div className="task-title-row">
                                <h4 className="task-title">{task.title}</h4>
                                <span className={`priority-badge priority-${task.priority || "medium"}`}>
                                  {task.priority || "medium"}
                                </span>
                                {task.isOptimistic && (
                                  <span className="optimistic-tag">Syncing...</span>
                                )}
                              </div>
                              {task.description && (
                                <p className="task-description">{task.description}</p>
                              )}
                              <span className="task-date">
                                Added {new Date(task.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="task-actions">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(task)}
                              className="edit-action-btn"
                              title="Edit Task"
                              aria-label={`Edit ${task.title}`}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskToDelete(task)}
                              className="delete-action-btn"
                              title="Delete Task"
                              aria-label={`Delete ${task.title}`}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TaskManager;
