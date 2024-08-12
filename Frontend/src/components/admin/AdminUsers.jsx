import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "simple-datatables";
import axios from "axios";
import * as XLSX from "xlsx";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    phoneNumber: "",
    schoolId: "",
    className: "",
    accessLevel: "student",
  });
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchSchools();
      fetchClasses();
    }
  }, [token]);

  useEffect(() => {
    if (users.length > 0) {
      const table = document.querySelector("#userTable");
      new DataTable(table);
    }
  }, [users]);

  const fetchUsers = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setUsers(response.data.allUsers))
      .catch((error) => console.error("Error fetching users:", error));
  };

  const fetchSchools = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/schools`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setSchools(response.data.schools))
      .catch((error) => console.error("Error fetching schools:", error));
  };

  const fetchClasses = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setClasses(response.data.classes))
      .catch((error) => console.error("Error fetching classes:", error));
  };

  const getSchoolNameById = (schoolId) => {
    const school = schools.find((school) => school._id === schoolId);
    return school ? school.schoolName : "Unknown School";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleCreateUser = () => {
    if (token) {
      axios
        .post(`${import.meta.env.VITE_API_URL}/admin/user`, newUser, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          fetchUsers();
          setNewUser({
            name: "",
            phoneNumber: "",
            schoolId: "",
            className: "",
            accessLevel: "student",
          });
        })
        .catch((error) => console.error("Error creating user:", error));
    }
  };

  const handleExportToExcel = (data, filename) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, filename);
  };

  const handleExportBySchool = () => {
    if (selectedSchool) {
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/admin/submitted-tests/${selectedSchool}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          const exportData = response.data.users.flatMap((user) => {
            const userData = {
              UserID: user.userId,
              Name: user.name,
              Phone: user.phoneNumber,
              School: getSchoolNameById(user.school),
              Class: user.class,
              AccessLevel: user.accessLevel,
              CreatedAt: user.createdAt,
            };

            if (user.givenTests && user.givenTests.length > 0) {
              return user.givenTests.map((test) => ({
                ...userData,
                TestName: test.testName,
                Score: `${test.score}/${test.answers.length}`,
              }));
            }
            return userData;
          });

          handleExportToExcel(exportData, "Users_By_School_With_Tests.xlsx");
        })
        .catch((error) => console.error("Error fetching users by school:", error));
    }
  };

  const handleExportByClass = () => {
    if (selectedClass) {
      axios
        .post(
          `${import.meta.env.VITE_API_URL}/admin/submitted-tests`,
          { className: selectedClass },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          const exportData = response.data.users.flatMap((user) => {
            const userData = {
              UserID: user.userId,
              Name: user.name,
              Phone: user.phoneNumber,
              School: getSchoolNameById(user.school),
              Class: user.class,
              AccessLevel: user.accessLevel,
              CreatedAt: user.createdAt,
            };

            if (user.givenTests && user.givenTests.length > 0) {
              return user.givenTests.map((test) => ({
                ...userData,
                TestName: test.testName,
                Score: `${test.score}/${test.answers.length}`,
              }));
            }

            return userData;
          });

          handleExportToExcel(exportData, "Users_By_Class_With_Tests.xlsx");
        })
        .catch((error) => console.error("Error fetching users by class:", error));
    }
  };

  return (
    <div className="container mx-auto pt-20 px-4">
      {/* Create User Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newUser.name}
            onChange={handleInputChange}
            className="border px-4 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={newUser.phoneNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"
          />
          <select
            name="schoolId"
            value={newUser.schoolId}
            onChange={handleInputChange}
            className="border px-4 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.schoolName}
              </option>
            ))}
          </select>
          <select
            name="className"
            value={newUser.className}
            onChange={handleInputChange}
            className="border px-4 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreateUser}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Create User
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-8">
        <button
          onClick={() => handleExportToExcel(users, "Users.xlsx")}
          className="bg-green-500 text-white px-4 py-2"
        >
          Export All Users to Excel
        </button>
      </div>

      {/* Dropdowns for Exporting by School/Class */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Export Submitted Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="border px-4 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school._id} value={school._id}>
                {school.schoolName}
              </option>
            ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-4 py-2 bg-white text-black dark:bg-gray-800 dark:text-white"          
            >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportBySchool}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Export by School
          </button>
          <button
            onClick={handleExportByClass}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Export by Class
          </button>
        </div>
      </div>

      {/* User Table Section */}
      <table
        id="userTable"
        className="min-w-full bg-white text-black dark:bg-gray-800 dark:text-white"
      >
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">School</th>
            <th className="py-2 px-4 border-b">Class</th>
            <th className="py-2 px-4 border-b">Access Level</th>
            <th className="py-2 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td className="py-2 px-4 border-b">
                <Link
                  to={`/admin/user/${user.userId}`}
                  className="text-blue-500 underline"
                >
                  {user.userId}
                </Link>
              </td>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.phoneNumber}</td>
              <td className="py-2 px-4 border-b">
                {getSchoolNameById(user.school)}
              </td>
              <td className="py-2 px-4 border-b">{user.class}</td>
              <td className="py-2 px-4 border-b">{user.accessLevel}</td>
              <td className="py-2 px-4 border-b">{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
