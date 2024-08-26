import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Question() {
  const location = useLocation();
  const navigate = useNavigate();
  const { test } = location.state || { test: {} };
  const testId = test._id;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(
    test.questions[currentQuestionIndex]?.timeLimit * 60 || 0
  );
  const timerRef = useRef();
  const [tenSecondsAlertShown, setTenSecondsAlertShown] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const element = document.documentElement;
  useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (!test || !test.questions) {
      navigate("/tests", { replace: true });
    }
  }, [test, navigate]);

  const question = test.questions[currentQuestionIndex];

  useEffect(() => {
    // Set the initial time limit for the current question
    setTimeLeft(question.timeLimit * 60);
    setQuestionStartTime(Date.now());
    setTenSecondsAlertShown(false);

    // Clear the previous timer if it exists
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start the timer for the current question
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = prevTimeLeft - 1;
        if (newTimeLeft === 10 && !tenSecondsAlertShown) {
          toast.error("Less than 10 seconds left!");
          setTenSecondsAlertShown(true);
        }
        if (newTimeLeft <= 0) {
          clearInterval(timerRef.current);
          handleNextQuestion(true); // Move to the next question if time runs out
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [currentQuestionIndex]);

  const handleOptionChange = (value) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: value,
    });

    setAnsweredQuestions(new Set(answeredQuestions.add(currentQuestionIndex)));
  };

  const handleNextQuestion = (autoJump = false) => {
    if (answeredQuestions.has(currentQuestionIndex) || autoJump) {
      // Record the time taken for the current question
      const questionEndTime = Date.now();
      const timeTaken = Math.floor((questionEndTime - questionStartTime) / 1000);

      setUserAnswers({
        ...userAnswers,
        [`${currentQuestionIndex}-timeTaken`]: timeTaken,
        [currentQuestionIndex]: userAnswers[currentQuestionIndex] || "",
      });

      if (currentQuestionIndex < test.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      alert("Please select an option before proceeding.");
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = test.questions.map((question, index) => ({
      questionText: question.questionText,
      givenAnswer: userAnswers[index] || "",
      timeTaken: (userAnswers[`${index}-timeTaken`] || 0) / 60, // Convert seconds to minutes
    }));

    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("ID");
      if (token && id) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/submit-test`,
            {
              id,
              testId,
              testName: test.testName,
              answers: formattedAnswers,
              totalTimeTaken: Object.values(userAnswers)
                .filter((val) => typeof val === "number")
                .reduce((acc, val) => acc + val, 0) / 60, // Convert total time taken to minutes
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          navigate("/results", {
            state: { SubmittedTestId: response.data.givenTest._id, TestId: testId },
            replace: true,
          });
        } catch (error) {
          console.error("Error submitting test:", error);
        }
      } else {
        console.error("No token found");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (Object.keys(userAnswers).length > 0) {
        const confirmationMessage =
          "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = confirmationMessage; // For most browsers
        return confirmationMessage; // For older browsers
      }
    };

    const handlePopState = (event) => {
      if (Object.keys(userAnswers).length > 0) {
        const confirmationMessage =
          "You have unsaved changes. Are you sure you want to leave?";
        if (window.confirm(confirmationMessage)) {
          navigate("/tests");
        } else {
          event.preventDefault(); // Prevent navigation
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [userAnswers, navigate]);

  return (
    <div className="h-screen justify-center max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col py-4">
      <div className="h-fit p-6 shadow-xl border-2 border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-slate-800 text-black dark:text-white flex flex-col items-center mx-4">
        <h1 className="text-2xl md:text-4xl mb-4">Quiz: {test.testName}</h1>
        <div className="mb-6 w-full">
          <h2 className="text-xl mb-4">
            Question {currentQuestionIndex + 1}: {question.questionText}
          </h2>
          <div className="mb-4 text-right">
            Time left: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
          </div>
          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionChange(option)}
                className={`px-4 py-2 rounded-md border shadow-xl hover:scale-105 duration-200 ${
                  userAnswers[currentQuestionIndex] === option
                    ? "bg-[#ff33cc] text-white"
                    : "bg-white text-black border-gray-300 dark:bg-slate-700 dark:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center w-full">
          {currentQuestionIndex < test.questions.length - 1 && (
            <button
              className="btn w-[100%] max-w-80 shadow-xl hover:scale-105 duration-200 btn-secondary"
              onClick={handleNextQuestion}
              disabled={!answeredQuestions.has(currentQuestionIndex)}
            >
              Next
            </button>
          )}
          {currentQuestionIndex === test.questions.length - 1 && (
            <button
              className="btn btn-secondary shadow-xl hover:scale-105 duration-200"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Question;
