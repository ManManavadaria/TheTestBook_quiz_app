import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ScoreCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { SubmittedTestId, TestId } = location.state || {};

  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [testName, setTestName] = useState("");
  const [questionsLength, setQuestionsLength] = useState(null);
  const [timeTaken, setTime] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (SubmittedTestId && token) {
      const fetchResult = async () => {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/scorecard`,
            {
              id: SubmittedTestId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setScore(response.data.givenTest.score);
          setAnswers(response.data.givenTest.answers);
          setTestName(response.data.givenTest.test.testName);
          setQuestionsLength(response.data.givenTest.answers.length);
          setTime(response.data.givenTest.totalTimeTaken);
        } catch (err) {
          setError("Failed to fetch result");
          console.error("Error fetching result:", err);
        }
      };
      fetchResult();
    } else {
      setError("No test ID provided");
    }
  }, [SubmittedTestId, token]);

  const handleBackToTests = () => {
    navigate("/tests");
  };

  const handleGiveFeedback = () => {
    if (TestId) {
      navigate("/feedback", { state: { TestId } });
    } else {
      alert("Test ID not available for feedback.");
    }
  };

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="justify-center max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col py-4">
      <div className="h-fit p-6 shadow-xl border-2 border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-slate-800 text-black dark:text-white flex flex-col items-center mx-4">
        <h1 className="text-2xl md:text-4xl mb-4">Score Card</h1>
        <div className="mb-6 w-full">
          <h2 className="text-xl mb-4">Test: {testName}</h2>
          <div className="grid gap-4">
          <p className="text-lg mb-2">Score: {score} / {questionsLength}</p>
          <p className="text-md mb-2">Total Time Taken: {timeTaken !== null ? `${timeTaken.toFixed(3)} m` : "Loading..."}</p>
            {/* <ul>
              {answers.map((item, index) => (
                <li key={index} className="mb-4">
                  <strong>Question {index + 1}:</strong> {item.questionText}
                  <br />
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      className={`px-4 py-2 rounded-md border shadow-xl ${
                        item.givenAnswer === item.correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                      disabled
                    >
                      Your Answer: {item.givenAnswer}
                    </button>
                    {item.givenAnswer !== item.correctAnswer && (
                      <button
                        className="px-4 py-2 rounded-md border shadow-xl bg-green-500 text-white"
                        disabled
                      >
                        Correct Answer: {item.correctAnswer}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul> */}
          </div>
        </div>
        <div className="flex space-x-4 mt-4">
          <button
            className="btn btn-secondary shadow-xl hover:scale-105 duration-200"
            onClick={handleBackToTests}
          >
            Back to Tests
          </button>
          <button
            className="btn btn-primary shadow-xl hover:scale-105 duration-200"
            onClick={handleGiveFeedback}
          >
            Give Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
