import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "simple-datatables";
import AdminNavbar from "./AdminNavbar";

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [editClassId, setEditClassId] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassInput, setNewClassInput] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      // Fetch classes from API
      axios.get(`${import.meta.env.VITE_API_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setClasses(response.data.classes))
      .catch((error) => console.error("Error fetching classes:", error));
    }
  }, [token]);

  useEffect(() => {
    if (classes.length > 0) {
      const table = document.querySelector("#classTable");
      new DataTable(table);
    }
  }, [classes]);

  const handleEditClick = (classId, currentName) => {
    setEditClassId(classId);
    setNewClassName(currentName);
  };

  const handleSaveClick = async (classId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/class/${classId}`,
        { className: newClassName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses((prevClasses) =>
        prevClasses.map((classItem) =>
          classItem._id === classId ? { ...classItem, className: newClassName } : classItem
        )
      );
      setEditClassId(null);
      setNewClassName("");
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const handleDeleteClick = async (classId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/class/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClasses((prevClasses) =>
        prevClasses.filter((classItem) => classItem._id !== classId)
      );
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleAddNewClass = async () => {
    if (!newClassInput.trim()) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/class`,
        { className: newClassInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses((prevClasses) => [...prevClasses, response.data.class]);
      setNewClassInput("");
    } catch (error) {
      console.error("Error adding new class:", error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto mt-16 pt-5">
        {/* Add New Class Section */}
        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="New Class Name"
            value={newClassInput}
            onChange={(e) => setNewClassInput(e.target.value)}
            className="px-3 py-2 border rounded-md outline-none bg-white text-black dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={handleAddNewClass}
            className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-700 transition-colors duration-200"
          >
            Add Class
          </button>
        </div>

        <table id="classTable" className="min-w-full bg-white text-black dark:bg-gray-800 dark:text-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Class</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem._id}>
                <td className="py-2 px-4 border-b">{classItem._id}</td>
                <td className="py-2 px-4 border-b">
                  {editClassId === classItem._id ? (
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="border px-3 py-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 outline-none"
                    />
                  ) : (
                    classItem.className
                  )}
                </td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  {editClassId === classItem._id ? (
                    <>
                      <button
                        onClick={() => handleSaveClick(classItem._id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditClassId(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(classItem._id, classItem.className)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(classItem._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminClasses;
