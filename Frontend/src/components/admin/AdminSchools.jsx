import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "simple-datatables";
import AdminNavbar from "./AdminNavbar";

function AdminSchools() {
  const [schools, setSchools] = useState([]);
  const [editSchoolId, setEditSchoolId] = useState(null);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolInput, setNewSchoolInput] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      // Fetch schools from API
      axios.get(`${import.meta.env.VITE_API_URL}/schools`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setSchools(response.data.schools))
      .catch((error) => console.error("Error fetching schools:", error));
    }
  }, [token]);

  useEffect(() => {
    if (schools.length > 0) {
      const table = document.querySelector("#schoolTable");
      new DataTable(table);
    }
  }, [schools]);

  const handleEditClick = (schoolId, currentName) => {
    setEditSchoolId(schoolId);
    setNewSchoolName(currentName);
  };

  const handleSaveClick = async (schoolId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/school/${schoolId}`,
        { schoolName: newSchoolName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchools((prevSchools) =>
        prevSchools.map((school) =>
          school._id === schoolId ? { ...school, schoolName: newSchoolName } : school
        )
      );
      setEditSchoolId(null);
      setNewSchoolName("");
    } catch (error) {
      console.error("Error updating school:", error);
    }
  };

  const handleDeleteClick = async (schoolId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/school/${schoolId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSchools((prevSchools) =>
        prevSchools.filter((school) => school._id !== schoolId)
      );
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };

  const handleAddNewSchool = async () => {
    if (!newSchoolInput.trim()) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/school`,
        { schoolName: newSchoolInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchools((prevSchools) => [...prevSchools, response.data.school]);
      setNewSchoolInput("");
    } catch (error) {
      console.error("Error adding new school:", error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto mt-16 pt-5">
        {/* Add New School Section */}
        <div className="mb-4 flex items-center space-x-4">
          <input
            type="text"
            placeholder="New School Name"
            value={newSchoolInput}
            onChange={(e) => setNewSchoolInput(e.target.value)}
            className="px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
          />
          <button
            onClick={handleAddNewSchool}
            className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-700 duration-200"
          >
            Add School
          </button>
        </div>

        <table id="schoolTable" className="min-w-full bg-white text-black dark:bg-slate-800 dark:text-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">School</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school._id}>
                <td className="py-2 px-4 border-b">{school._id}</td>
                <td className="py-2 px-4 border-b">
                  {editSchoolId === school._id ? (
                    <input
                      type="text"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    school.schoolName
                  )}
                </td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  {editSchoolId === school._id ? (
                    <>
                      <button
                        onClick={() => handleSaveClick(school._id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditSchoolId(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(school._id, school.schoolName)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(school._id)}
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

export default AdminSchools;
