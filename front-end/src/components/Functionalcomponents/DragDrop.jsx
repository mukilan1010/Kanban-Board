import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../css/DragDrop.css";

const DragDrop = () => {
    const [sections, setSections] = useState({
        TODO: [],
        Completed: [],
        section3: [],
    });

    const [draggedItem, setDraggedItem] = useState(null);
    const [newItem, setNewItem] = useState("");

    const handleDragStart = (item, fromSection) => {
        setDraggedItem({ item, fromSection });
    };

    const handleDrop = (toSection, index = null) => {
        if (!draggedItem) return;

        const updatedSections = { ...sections };
        updatedSections[draggedItem.fromSection] = updatedSections[draggedItem.fromSection].filter(
            (i) => i !== draggedItem.item
        );

        if (index !== null) {
            updatedSections[toSection].splice(index, 0, draggedItem.item);
        } else {
            updatedSections[toSection].push(draggedItem.item);
        }

        setSections(updatedSections);
        setDraggedItem(null);
    };

    const handleAddItem = () => {
        if (newItem.trim() === "") return;
        setSections((prevSections) => ({
            ...prevSections,
            TODO: [...prevSections.TODO, newItem], // Add to the TODO section by default
        }));
        setNewItem("");
    };

    const handleDeleteItem = (section, itemToDelete) => {
        setSections((prevSections) => ({
            ...prevSections,
            [section]: prevSections[section].filter((item) => item !== itemToDelete),
        }));
    };

    return (
        <div className="drag-drop-container">
            <div className="input-container">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new task"
                />
                <button onClick={handleAddItem}>Add TASK</button>
            </div>
            {Object.keys(sections).map((section) => (
                <div
                    key={section}
                    className="drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(section)}
                >
                    <h2 className="section-title">{section.toUpperCase()}</h2>
                    {sections[section].map((item, index) => (
                        <div
                            key={item}
                            draggable
                            onDragStart={() => handleDragStart(item, section)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(section, index)}
                            className={`draggable-item ${draggedItem?.item === item ? "dragging" : ""}`}
                        >
                            {item}
                            <FaTrash className="delete-icon" onClick={() => handleDeleteItem(section, item)} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DragDrop;
