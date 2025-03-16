import React, { useState, useEffect, useCallback } from "react";
import {
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import "../css/DragDrop.css";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useContext } from "react";
import { UserContext } from "../../App";
const DragDrop = () => {
  const { userDetail, setUserDetail } = useContext(UserContext);
  const [sections, setSections] = useState({
    TODO: [],
    Completed: [],
    BackLogs: [],
  });
  const navigate = useNavigate();

  const [taskDescription, setTaskDescription] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComment, setTaskComment] = useState("");
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navigateToProfile = () => {
    navigate("/profile");
    setIsProfileOpen(false);
  };
  
  const handleAddItem = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewItem("");
    setDueDate("");
  };

  const handleDragStart = (item, fromSection) => {
    setDraggedItem({ item, fromSection });
  };

  const handleDrop = async (toSection, index = null) => {
    if (!draggedItem) return;

    try {
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/updateTask",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: draggedItem.item.name || draggedItem.item, 
            fromSection: draggedItem.fromSection,
            toSection: toSection,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }

      setSections((prevSections) => {
        const updatedSections = { ...prevSections };
        updatedSections[draggedItem.fromSection] = updatedSections[
          draggedItem.fromSection
        ].filter((i) => i !== draggedItem.item);

        if (!updatedSections[toSection].includes(draggedItem.item)) {
          if (index !== null) {
            updatedSections[toSection].splice(index, 0, draggedItem.item);
          } else {
            updatedSections[toSection].push(draggedItem.item);
          }
        }

        return updatedSections;
      });

      setDraggedItem(null);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task section:", error);
    }
  };

  const handleSaveTask = async () => {
    if (newItem.trim() === "") return;


    const taskExists =
      sections["TODO"] &&
      sections["TODO"].some((item) => {
        return typeof item === "object"
          ? item.name === newItem
          : item === newItem;
      });

    if (taskExists) {
      toast("The task is already in todo");
      setNewItem("");
      setDueDate("");
      return;
    }

    try {
      console.log(userDetail);
      console.log(localStorage.getItem("email"));
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/addTask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: newItem,
            due: dueDate,
            description: taskDescription,
            section: "TODO",
            userEmail: localStorage.getItem("email"),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }
      toast("Task added successfully!");
      setNewItem("");
      setDueDate("");
      setIsPopupOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const results = [];
    const lowercaseTerm = term.toLowerCase();

    Object.entries(sections).forEach(([sectionName, tasks]) => {
      tasks.forEach((task) => {
        const taskName =
          typeof task === "object"
            ? task.name.toLowerCase()
            : task.toLowerCase();
        if (taskName.includes(lowercaseTerm)) {
          results.push({
            ...task,
            section: sectionName,
          });
        }
      });
    });

    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((term) => handleSearch(term), 300),
    [sections]
  );

  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleSearchResultClick = (result) => {
    const section = result.section;
    const taskName = typeof result === "object" ? result.name : result;

    const task = sections[section].find((item) =>
      typeof item === "object" ? item.name === taskName : item === taskName
    );

    if (task) {
      handleTaskClick(task, section);
    }
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://kanban-board-fjzt.vercel.app/getTasks?userEmail=${localStorage.getItem(
          "email"
        )}`
      );
      const data = await response.json();

      console.log("Fetched Data:", data);

      setSections({
        TODO: data.TODO || [],
        Completed: data.Completed || [],
        BackLogs: data.BackLogs || [],
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDeleteItem = async (section, item) => {
    try {
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/deleteTask",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: typeof item === "object" ? item.name : item,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }

      setSections((prevSections) => {
        const updatedSections = { ...prevSections };
        updatedSections[section] = updatedSections[section].filter(
          (task) => task !== item
        );
        return updatedSections;
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditedText(typeof item === "object" ? item.name : item);
  };

  const handleSaveEdit = async (oldTask) => {
    if (editedText.trim() === "") return;

    try {
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/editTask",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldTask: typeof oldTask === "object" ? oldTask.name : oldTask,
            newTask: editedText,
            section: "TODO",
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }

      setSections((prevSections) => {
        const updatedSections = { ...prevSections };
        updatedSections["TODO"] = updatedSections["TODO"].map((task) =>
          task === oldTask ? editedText : task
        );
        return updatedSections;
      });

      setEditingItem(null);
      setEditedText("");
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskClick = (item, section) => {
    if (editingItem || draggedItem) return;

    const taskName = typeof item === "object" ? item.name : item;

    setSelectedTask({
      name: taskName,
      due: typeof item === "object" ? item.due : null,
      description: typeof item === "object" ? item.description : "",
      section,
    });

    setEditedText(taskName);
    setDueDate(typeof item === "object" && item.due ? item.due : "");
    setTaskDescription(
      typeof item === "object" && item.description ? item.description : ""
    );
    setIsTaskDetailOpen(true);

    if (taskName) {
      fetchComments(taskName);
    } else {
      console.error("Task name is undefined or empty");
    }
  };

  const fetchComments = async (taskName) => {
    if (!taskName) {
      console.error("Task name is required to fetch comments");
      return;
    }

    try {
      const response = await fetch(
        `https://kanban-board-fjzt.vercel.app/getComments?task=${encodeURIComponent(
          taskName
        )}`
      );
      const data = await response.json();
      if (response.ok) {
        setComments((prevComments) => ({
          ...prevComments,
          [taskName]: data.comments,
        }));
      } else {
        console.error("Error fetching comments:", data.error);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!taskComment.trim() || !selectedTask) return;

    const taskName =
      typeof selectedTask === "object" ? selectedTask.name : selectedTask;

    try {
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/addComment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: taskName,
            comment: taskComment,
          }),
        }
      );

      if (response.ok) {
        setComments((prevComments) => ({
          ...prevComments,
          [taskName]: [...(prevComments[taskName] || []), taskComment],
        }));
        setTaskComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
    setTaskComment("");
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    const taskName =
      typeof selectedTask === "object" ? selectedTask.name : selectedTask;
    const updatedName = editedText;

    try {
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/editTask",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldTask: taskName,
            newTask: updatedName,
            due: dueDate,
            description: taskDescription,
            section: selectedTask.section,
          }),
        }
      );

      if (response.ok) {
        setIsTaskDetailOpen(false);
        setSelectedTask(null);
        setEditedText("");
        setDueDate("");
        setTaskDescription("");
        fetchTasks();
        toast("Task upadated successfully");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  const handleDeleteTaskFromDetail = async () => {
    if (!selectedTask) return;

    const taskName =
      typeof selectedTask === "object" ? selectedTask.name : selectedTask;
    const section = selectedTask.section;

    try {
      const response = await fetch(
        "https://kanban-board-fjzt.vercel.app/deleteTask",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: taskName,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }

     
      setSections((prevSections) => {
        const updatedSections = { ...prevSections };
        updatedSections[section] = updatedSections[section].filter((task) => {
          const taskValue = typeof task === "object" ? task.name : task;
          return taskValue !== taskName;
        });
        return updatedSections;
      });

    
      setIsTaskDetailOpen(false);
      setSelectedTask(null);
      toast.success("Successfully deleted", { autoClose: 2000 });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="drag-drop-container">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="header">
        <h1>Kanban Board</h1>
        <div
          className="profile-container"
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <div className="profile-icon">
            <FaUserCircle size={24} />
          </div>
          {isProfileOpen && (
            <div className="profile-dropdown">
              <button onClick={navigateToProfile}>My Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className="input-container">
        <button onClick={handleAddItem} className="add-task-btn">
          Add TASK
        </button>
        <div className="search-container" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchInputChange}
            placeholder="Search tasks..."
            className="search-input"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((task, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(task)}
                >
                  <span>{typeof task === "object" ? task.name : task}</span>
                  {typeof task === "object" && task.section && (
                    <span className="result-section">{task.section}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Add Task</h2>
            <div className="form-group">
              <label className="task-label task-name-label">Task Name</label>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter task name"
              />
            </div>

            <div className="form-group">
              <label className="task-label task-date-label">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="task-label task-desc-label">Description</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description"
                className="task-description"
              />
            </div>

            <div className="popup-buttons">
              <button onClick={handleClosePopup}>Cancel</button>
              <button onClick={handleSaveTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
      {/* Task Detail Popup */}

      {isTaskDetailOpen && selectedTask && (
        <div className="popup-overlay">
          <div className="popup-box task-detail-popup">
            <h2>Task Details</h2>

            <div className="task-edit-section">
              <label>Task Name:</label>
              <input
                type="text"
                value={
                  editedText ||
                  (typeof selectedTask === "object"
                    ? selectedTask.name
                    : selectedTask)
                }
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Task Name"
              />

              <label>Due Date:</label>
              <input
                type="date"
                value={
                  dueDate ||
                  (typeof selectedTask === "object" && selectedTask.due
                    ? selectedTask.due
                    : "")
                }
                onChange={(e) => setDueDate(e.target.value)}
              />
              <label>Description:</label>
              <textarea
                value={
                  taskDescription ||
                  (typeof selectedTask === "object" && selectedTask.description
                    ? selectedTask.description
                    : "")
                }
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                className="task-description"
              />

              <button onClick={handleUpdateTask} className="update-task-btn">
                Update Task
              </button>
              <button
                onClick={handleDeleteTaskFromDetail}
                className="delete-task-btn"
              >
                Delete Task
              </button>
            </div>

            <div className="task-comments-section">
              <h3>Comments</h3>
              <div className="comments-list">
                {comments[
                  typeof selectedTask === "object"
                    ? selectedTask.name
                    : selectedTask
                ]?.length > 0 ? (
                  comments[
                    typeof selectedTask === "object"
                      ? selectedTask.name
                      : selectedTask
                  ].map((comment, index) => (
                    <div key={index} className="comment-item">
                      <p>{comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet</p>
                )}
              </div>

              <div className="add-comment-section">
                <textarea
                  value={taskComment}
                  onChange={(e) => setTaskComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-input"
                />
                <button onClick={handleAddComment} className="add-comment-btn">
                  Add Comment
                </button>
              </div>
            </div>

            <button onClick={handleCloseTaskDetail} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {Object.keys(sections).map((section) => (
        <div
          key={section}
          className="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(section)}
        >
           <h2 className="section-title">
      {section === "Completed" ? "INPROGRESS" : 
       section === "BackLogs" ? "COMPLETED" : 
       section.toUpperCase()}
    </h2>
          {(isSearching ? filteredSections[section] : sections[section])
            .length === 0 ? (
            <div className="empty-container">
              <p className="empty-message">
                {isSearching
                  ? "No matching tasks found."
                  : section === "TODO"
                  ? "No tasks to do! Add one to get started."
                  : section === "Completed"
                  ? "No completed tasks yet! Keep going!"
                  : "No backlog tasks! Stay on track!"}
              </p>
            </div>
          ) : (
            (isSearching ? filteredSections[section] : sections[section]).map(
              (item, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(item, section)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(section, index)}
                  onClick={() => handleTaskClick(item, section)}
                  className={`draggable-item ${
                    draggedItem?.item === item ? "dragging" : ""
                  } ${section === "Completed" ? "completed-task" : ""} ${
                    section === "BackLogs" ? "back-task" : ""
                  }`}
                >
                  {editingItem === item ? (
                    <>
                      <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FaCheck
                        className="save-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(item);
                        }}
                      />
                      <FaTimes
                        className="cancel-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(null);
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {typeof item === "object" ? (
                        <>
                          <span>{item.name}</span>
                          {item.due && (
                            <span className="due-date"> (Due: {item.due})</span>
                          )}
                        </>
                      ) : (
                        <span>{item}</span>
                      )}
                    </>
                  )}
                </div>
              )
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default DragDrop;
