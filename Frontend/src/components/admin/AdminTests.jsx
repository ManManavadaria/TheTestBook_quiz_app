import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";
import {DataTable} from "simple-datatables";

function AdminTests() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/tests`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(response.data)
        setTests(response.data.Tests);
        console.log(tests)
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchTests();
  }, []);

  useEffect(() => {
    if (tests.length > 0) {
      const dataTable = new DataTable("#testsTable");
    }
  }, [tests]);

  const handleEdit = (testId) => {
    navigate(`/admin/test/${testId}`);
  };

  return (
    <>
      <AdminNavbar />
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 mt-16">
        <div className="w-full max-w-7xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-black dark:text-white">
              All Tests
            </h3>
            <Link
              to="/admin/create-test"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Test
            </Link>
          </div>

          <table id="testsTable" className="table-auto w-full bg-gray-50 dark:bg-gray-700 text-black dark:text-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Test Name</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Total Time Limit</th>
                <th className="px-4 py-2">Questions Length</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Dummy</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.testId} className="bg-white dark:bg-gray-800">
                  <td className="border px-4 py-2">{test.testName}</td>
                  <td className="border px-4 py-2">{test.subject}</td>
                  <td className="border px-4 py-2">{test.totalTimeLimit} mins</td>
                  <td className="border px-4 py-2">{test.questions.length}</td>
                  <td className="border px-4 py-2">
                    {new Date(test.createdAt).toUTCString()}
                  </td>
                  {console.log(test.isDummy)}
                  <td className="border px-4 py-2">{test.isDummy.toString()}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleEdit(test._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminTests;
