import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function UserProfile() {
  const [user, setUser] = useState({});
  const [givenTests, setGivenTests] = useState([]);
  const [allowedTests, setAllowedTests] = useState([]);
  const [schools, setSchools] = useState([]);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("ID");

      if (token && id) {
        try {
          // Fetch user data
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/user-details`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = userResponse.data;
          setUser(userData);
          setGivenTests(userData.givenTests);
          setAllowedTests(userData.allowedTests);

          // Fetch school list
          const schoolsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/schools`);
          setSchools(schoolsResponse.data.schools);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const getInitials = (name) => {
    if (!name) return ""; // Handle null or undefined names
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const handleTestClick = (testId) => {
    setExpandedTestId(expandedTestId === testId ? null : testId);
  };

  const getTestNameById = (testId) => {
    const test = allowedTests.find((test) => test._id === testId);
    return test ? test.testName : "Unknown";
  };

  const getSchoolNameById = (schoolId) => {
    const school = schools.find((school) => school._id === schoolId);
    return school ? school.schoolName : "Unknown School";
  };

  return (
    <>
      <Navbar/>
      <div className="justify-center max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col py-4 mt-14">
        <div className="h-fit p-6 shadow-xl border-2 border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-slate-800 text-black dark:text-white flex flex-col items-center mx-4">
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-pink-500 text-white text-3xl font-bold mb-4">
            {getInitials(user.name || "")}
          </div>
          <h1 className="text-2xl md:text-4xl mb-4">{user.name || "User Name"}</h1>
          <p className="text-md mb-2">{user.phoneNumber || "Phone Number"}</p>
          <p className="text-md mb-2">{getSchoolNameById(user.school) || "School"}</p>
          <p className="text-md mb-4">{user.class || "Class"}</p>
          <button
            className="btn btn-secondary shadow-xl hover:scale-105 duration-200 mb-6"
            onClick={() => navigate("/update-profile")}
          >
            Update Profile
          </button>
          <div className="w-full">
            <h2 className="text-xl mb-4">Your Test Results</h2>
            <div className="grid gap-4">
              {givenTests.length > 0 ? (
                givenTests.map((test) => (
                  <div
                    key={test._id}
                    className="px-4 py-2 rounded-md border shadow-xl bg-white text-black dark:bg-slate-700 dark:text-white" 
                  >
                    <div
                      onClick={() => handleTestClick(test._id)}
                      className="cursor-pointer mb-2 "
                    >
                      <h3 className="text-lg font-semibold">Test Name: {getTestNameById(test.test)}</h3>
                      <p className="text-md">Score: {test.score || "0"}</p>
                      <p className="text-md">Submitted On: {new Date(test.createdAt).toLocaleString() || "undefined"}</p>
                    </div>
                    {expandedTestId === test._id && (
                      <div className="mt-4">
                        <h4 className="text-md font-bold mb-2">Details:</h4>
                        <p className="text-md mb-2">Total Time Taken: {test.totalTimeTaken} m</p>
                        <h4 className="text-md font-bold mb-2">Answers:</h4>
                        <ul>
                          {test.answers.map((answer, idx) => (
                            <li key={idx} className="mb-2">
                              <strong>Question {idx + 1}:</strong> {answer.questionText}
                              <br />
                              <div className="flex flex-col gap-2">
                                <button
                                  className={`px-4 py-2 rounded-md border shadow-xl ${
                                    answer.givenAnswer === answer.correctAnswer
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  Your Answer: {answer.givenAnswer}
                                </button>
                                {answer.givenAnswer !== answer.correctAnswer && (
                                  <button className="px-4 py-2 rounded-md border shadow-xl bg-green-500 text-white">
                                    Correct Answer: {answer.correctAnswer}
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No test results available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
