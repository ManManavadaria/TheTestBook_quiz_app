import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ScoreCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { SubmittedTestId } = location.state || {}; // Ensure to pass the SubmittedTestId from the previous page
  console.log(SubmittedTestId);

  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [testName, setTestName] = useState("");
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
          console.log(response.data);

          setScore(response.data.givenTest.score);
          setAnswers(response.data.givenTest.answers);
          console.log(response.data.givenTest.test);
          setTestName(response.data.givenTest.test.testName);
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

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="justify-center max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col py-4">
      <div className="h-fit p-6 shadow-xl border-2 border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-slate-800 text-black dark:text-white flex flex-col items-center mx-4">
        <h1 className="text-2xl md:text-4xl mb-4">Score Card</h1>
        <div className="mb-6 w-full">
          <h2 className="text-xl mb-4">Test: {testName}</h2>
          <div className="grid gap-4">
            <p className="text-lg mb-2">Score: {score}</p>
            <ul>
              {answers.map((item, index) => (
                <li key={index} className="mb-2">
                  <strong>Question {index + 1}:</strong> {item.questionText}
                  <br />
                  <div className="flex flex-col gap-2">
                    <button
                      className={`px-4 py-2 rounded-md border shadow-xl ${
                        item.givenAnswer === item.correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      Your Answer: {item.givenAnswer}
                    </button>
                    {item.givenAnswer !== item.correctAnswer && (
                      <button className="px-4 py-2 rounded-md border shadow-xl bg-green-500 text-white">
                        Correct Answer: {item.correctAnswer}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          className="btn btn-secondary shadow-xl hover:scale-105 duration-200"
          onClick={handleBackToTests}
        >
          Back to Tests
        </button>
      </div>
    </div>
  );    
}

export default ScoreCard;
