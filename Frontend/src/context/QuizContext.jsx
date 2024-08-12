// src/context/QuizContext.js

import React, { createContext, useContext, useState } from 'react';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [quizDetails, setQuizDetails] = useState({});
  const [questions, setQuestions] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('QuizDetailsScreen');
  const [result, setResult] = useState([]);
  const [timer, setTimer] = useState(0);
  const [endTime, setEndTime] = useState(0);

  return (
    <QuizContext.Provider
      value={{
        quizDetails,
        setQuizDetails,
        questions,
        setQuestions,
        currentScreen,
        setCurrentScreen,
        result,
        setResult,
        timer,
        setTimer,
        endTime,
        setEndTime,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => useContext(QuizContext);
