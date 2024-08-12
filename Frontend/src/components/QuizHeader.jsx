import React from "react";
import styled from "styled-components";

import { Flex } from "../../../styles/Global";
import { addLeadingZero, formatTime } from "../../../utils/helpers";

import Counter from "./Counter";

const ActiveQuestionNo = styled.span`
  font-size: clamp(40px, 5vw, 60px);
  font-weight: 500;
  color: ${({ theme }) => theme.colors.themeColor};
`;

const TotalQuestionNo = styled.span`
  font-size: clamp(20px, 5vw, 30px);
  font-weight: 500;
  color: ${({ theme }) => theme.colors.darkerGray};
`;

const QuizHeader = ({ activeQuestion, totalQuestions, timer }) => {
  return (
    // <Flex spaceBetween gap="6px">
    <div>
      <div>
        <ActiveQuestionNo>{activeQuestion + 1}</ActiveQuestionNo>
        <TotalQuestionNo>/{totalQuestions}</TotalQuestionNo>
      </div>
      {/* <Flex> */}
      <div>
        <Counter time={timer} />
      </div>
    </div>
    //{/* </Flex> </Flex> */}
  );
};

export default QuizHeader;
