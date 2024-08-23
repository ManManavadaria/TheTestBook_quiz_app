import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [feedbackText, setFeedbackText] = useState("");

  // Extract TestId from location.state
  const TestId = location.state?.TestId;

  // Redirect to /tests if TestId is missing
  useEffect(() => {
    if (!TestId) {
      navigate("/tests", { replace: true });
    }
  }, [TestId, navigate]);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please provide feedback before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("ID");

      if (token && userId && TestId) {
        await axios.post(`${import.meta.env.VITE_API_URL}/submit-feedback`, {
          testId: TestId,
          userId: userId,
          feedback: feedbackText,
        });

        toast.success("Feedback submitted successfully!");
        navigate("/tests", { replace: true, state: null }); // Navigate to /tests and clear state
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred while submitting your feedback.");
    }
  };

  const handleSkipFeedback = () => {
    navigate("/tests", { replace: true, state: null }); // Navigate to /tests without submitting feedback and clear state
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <div className="w-full max-w-2xl p-6 shadow-xl border-2 border-gray-300 rounded-lg dark:border-gray-700 bg-white dark:bg-slate-800 text-black dark:text-white">
        <h1 className="text-2xl md:text-4xl mb-4 text-center">We Value Your Feedback</h1>
        <textarea
          className="w-full p-4 mb-4 rounded-md border shadow-xl dark:bg-slate-700 dark:text-white dark:border-gray-700"
          rows="5"
          placeholder="Please share your thoughts about the test..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <button
            className="w-full md:w-auto btn btn-secondary shadow-xl hover:scale-105 duration-200"
            onClick={handleFeedbackSubmit}
          >
            Submit Feedback
          </button>
          <button
            className="w-full md:w-auto btn btn-primary shadow-xl hover:scale-105 duration-200"
            onClick={handleSkipFeedback}
          >
            Go to Tests
          </button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
