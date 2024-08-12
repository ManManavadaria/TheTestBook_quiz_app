import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AdminNavbar from "./AdminNavbar";

function AdminEditTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const { register, handleSubmit, setValue } = useForm();

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch test data
    const fetchTest = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/test/${testId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data.test;
        setTestData(data);
        // Set default values
        setValue("testName", data.testName);
        setValue("subject", data.subject);
        setValue("totalTimeLimit", data.totalTimeLimit);
        setValue("questions", data.questions);
      } catch (error) {
        console.error("Error fetching test data:", error);
      }
    };

    // Fetch schools
    const fetchSchools = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/schools`);
        setSchools(response.data.schools);
        console.log(schools)
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };

    // Fetch classes
    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/classes`);
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data.allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchTest();
    fetchSchools();
    fetchClasses();
    fetchUsers();
  }, [setValue, testId, token]);

  const onSubmit = async (data) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/test`,
        { test: data, id: testId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Test updated successfully");
      navigate("/admin/tests");
    } catch (err) {
      if (err.response) {
        toast.error("Error: " + err.response.data.message);
      }
    }
  };

  const handleAllowTest = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/allow-test`,
        { testId, ...data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Test allowed successfully");
    } catch (err) {
      if (err.response) {
        toast.error("Error: " + err.response.data.message);
      }
    }
  };

  if (!testData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AdminNavbar />
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 mt-16">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test Name */}
              <div>
                <label className="text-black dark:text-white">Test Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("testName", { required: true })}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-black dark:text-white">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("subject", { required: true })}
                />
              </div>

              {/* Total Time Limit */}
              <div>
                <label className="text-black dark:text-white">Total Time Limit (mins)</label>
                <input
                  type="number"
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("totalTimeLimit", { required: true })}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="mt-6">
              <h3 className="font-bold text-lg text-black dark:text-white">Questions</h3>
              {testData.questions.map((question, index) => (
                <div key={index} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-700">
                  <div className="mb-4">
                    <label className="text-black dark:text-white">Question {index + 1}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                      defaultValue={question.questionText}
                      {...register(`questions.${index}.questionText`, { required: true })}
                    />
                  </div>

                  {/* Options */}
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="mb-2">
                      <label className="text-black dark:text-white">Option {optIndex + 1}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                        defaultValue={option}
                        {...register(`questions.${index}.options.${optIndex}`, { required: true })}
                      />
                    </div>
                  ))}

                  {/* Correct Answer */}
                  <div className="mb-4">
                    <label className="text-black dark:text-white">Correct Answer</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                      defaultValue={question.correctAnswer}
                      {...register(`questions.${index}.correctAnswer`, { required: true })}
                    />
                  </div>

                  {/* Time Limit */}
                  <div className="mb-4">
                    <label className="text-black dark:text-white">Time Limit (mins)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                      defaultValue={question.timeLimit}
                      {...register(`questions.${index}.timeLimit`, { required: true })}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Allow Test */}
            <div className="mt-6">
              <h3 className="font-bold text-lg text-black dark:text-white">Allow Test</h3>

              {/* School Dropdown */}
              <div className="mb-4">
                <label className="text-black dark:text-white">Select School</label>
                <select
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("schoolId")}
                >
                  <option value="">Select School</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Dropdown */}
              <div className="mb-4">
                <label className="text-black dark:text-white">Select Class</label>
                <select
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("className")}
                >
                  <option value="">Select Class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem.className}>
                      {classItem.className}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Dropdown */}
              <div className="mb-4">
                <label className="text-black dark:text-white">Select User</label>
                <select
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("userId")}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._d}>
                      {user.userId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleSubmit(handleAllowTest)}
                >
                  Allow Test
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Update Test
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminEditTest;
