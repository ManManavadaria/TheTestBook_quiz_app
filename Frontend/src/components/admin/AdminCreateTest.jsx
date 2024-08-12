import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

function AdminCreateTest() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDummy, setIsDummy] = useState(false);  // State for the checkbox

  const token = localStorage.getItem("token");

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("testName", data.testName);
    formData.append("subject", data.subject);
    formData.append("testFile", file);
    formData.append("isDummy", isDummy);  // Append the isDummy value

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/upload-test`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Test created successfully");
      reset();
      navigate("/admin/tests");
    } catch (error) {
      if (error.response) {
        toast.error("Error: " + error.response.data.message);
      }
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 mt-16">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Test Name */}
            <div className="mb-4">
              <label className="text-black dark:text-white">Test Name</label>
              <input
                type="text"
                className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                {...register("testName", { required: true })}
              />
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-black dark:text-white">Subject</label>
              <input
                type="text"
                className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                {...register("subject", { required: true })}
              />
            </div>

            {/* Test File */}
            <div className="mb-4">
              <label className="text-black dark:text-white">Upload Questions File (.xlsx)</label>
              <input
                type="file"
                accept=".xlsx"
                className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            {/* Dummy Test Checkbox */}
            <div className="mb-4">
              <label className="text-black dark:text-white">Set as Dummy Test</label>
              <input
                type="checkbox"
                className="ml-2"
                checked={isDummy}
                onChange={(e) => setIsDummy(e.target.checked)}
              />
            </div>

            {/* Create Test Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Create Test
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminCreateTest;
