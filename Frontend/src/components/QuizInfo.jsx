import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function QuizInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { test } = location.state || { test: {} };

  const handleStartQuiz = () => {
    navigate("/question", { state: { test } });
  };

  return (
    <>
      <div className="h-full max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row">
        <div className="w-full order-2 md:order-1 md:w-1/2 mt-12 md:mt-36 items-center m-auto">
          <div className="space-y-8 items-center flex flex-col">
            <h1 className="text-2xl md:text-4xl font-bold">
              Quiz Information
            </h1>
            <p className="text-sm md:text-xl mt-4">
              <span className="font-bold">Test Name:</span> {test.testName}
            </p>
            <p className="text-sm md:text-xl mt-4">
              <span className="font-bold">Subject:</span> {test.subject}
            </p>
            <p className="text-sm md:text-xl mt-4">
              <span className="font-bold">Total Time Limit:</span> {test.totalTimeLimit} minutes
            </p>
            <p className="text-sm md:text-xl mt-4">
              <span className="font-bold">Total Questions:</span> {test.questions.length}
            </p>
          <button className="btn mt-6 btn-secondary w-[70vw] max-w-[500px]" onClick={handleStartQuiz}>
            Start Quiz
          </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuizInfo;
