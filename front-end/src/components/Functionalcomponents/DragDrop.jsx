import React, { useState, useEffect } from "react";
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
  const navigate = useNavigate()

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
  

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Handle logout
  const handleLogout = () => {
  
    localStorage.removeItem("token");
    navigate("/");
  };

  // Handle navigate to profile page
  const navigateToProfile = () => {
    navigate("/profile");
    setIsProfileOpen(false);
  };
  // Make sure handleAddItem is defined properly
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
      const response = await fetch("http://localhost:3000/updateTask", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: draggedItem.item.name || draggedItem.item, // Handle both formats
          fromSection: draggedItem.fromSection,
          toSection: toSection,
        }),
      });

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

    // Check if the task already exists
    const taskExists =
      sections["TODO"] &&
      sections["TODO"].some((item) => {
        return typeof item === "object"
          ? item.name === newItem
          : item === newItem;
      });

    if (taskExists) {
      toast("The task is already in todo")
      setNewItem("");
      setDueDate("");
      return;
    }

    try {
      console.log(userDetail)
      console.log(localStorage.getItem('email'));
      const response = await fetch("http://localhost:3000/addTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newItem, due: dueDate,description: taskDescription, section: "TODO",userEmail:localStorage.getItem('email') }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }`x`
      toast("Task added successfully!")
      setNewItem("");
      setDueDate("");
      setIsPopupOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/getTasks?userEmail=${encodeURIComponent(localStorage.getItem('email'))}`);
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
      const response = await fetch("https://kanban-board-z99a.onrender.com/deleteTask", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: typeof item === "object" ? item.name : item,
        }),
      });

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
      const response = await fetch("http://localhost:3000/editTask", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldTask: typeof oldTask === "object" ? oldTask.name : oldTask,
          newTask: editedText,
          section: "TODO",
        }),
      });

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
      fetchTasks(); // Refresh the tasks
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // new
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
    setTaskDescription(typeof item === "object" && item.description ? item.description : "");
    setIsTaskDetailOpen(true);

    // Fetch comments for this task
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
        `http://localhost:3000/getComments?task=${encodeURIComponent(taskName)}`
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
      const response = await fetch("http://localhost:3000/addComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskName,
          comment: taskComment,
        }),
      });

      if (response.ok) {
        // Update the local comments state
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
      const response = await fetch("http://localhost:3000/editTask", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldTask: taskName,
          newTask: updatedName,
          due: dueDate,
          description: taskDescription,
          section: selectedTask.section,
        }),
      });

      if (response.ok) {
        setIsTaskDetailOpen(false);
        setSelectedTask(null);
        setEditedText("");
        setDueDate("");
        setTaskDescription("");
        fetchTasks();
        toast("Task upadated successfully")
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  const handleDeleteTaskFromDetail = async () => {
    if (!selectedTask) return;
    
    const taskName = typeof selectedTask === "object" ? selectedTask.name : selectedTask;
    const section = selectedTask.section;
    
    try {
      const response = await fetch("http://localhost:3000/deleteTask", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: taskName
        }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }
  
      // Remove from UI
      setSections((prevSections) => {
        const updatedSections = { ...prevSections };
        updatedSections[section] = updatedSections[section].filter(
          (task) => {
            const taskValue = typeof task === "object" ? task.name : task;
            return taskValue !== taskName;
          }
        );
        return updatedSections;
      });
      
      // Close the detail popup
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
              <button onClick={handleDeleteTaskFromDetail} className="delete-task-btn">
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
          <h2 className="section-title">{section.toUpperCase()}</h2>
          {sections[section].length === 0 ? (
            <div className="empty-container">
              <p className="empty-message">
                {section === "TODO"
                  ? "No tasks to do! Add one to get started."
                  : section === "Completed"
                  ? "No completed tasks yet! Keep going!"
                  : "No backlog tasks! Stay on track!"}
              </p>
            </div>
          ) : (
            sections[section].map((item, index) => (
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
                    
                    <FaCheck
                      className="save-icon"
                      onClick={() => handleSaveEdit(item)}
                    />
                    <FaTimes
                      className="cancel-icon"
                      onClick={() => setEditingItem(null)}
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
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default DragDrop;
