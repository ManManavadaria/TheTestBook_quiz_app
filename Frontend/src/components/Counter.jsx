import React from "react";
import styled from "styled-components";

// import { TimerIcon } from "../../../../config/icons";
// import { Flex } from "../../../../styles/Global";
// import { device } from "../../../../styles/BreakPoints";

const TimerStyle = styled.span`
  min-width: 60px;
  font-size: clamp(16px, 5vw, 24px);
  font-weight: 500;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.themeColor};
  @media ${device.md} {
    margin-left: 5px;
    min-width: 55px;
  }
`;

const Counter = ({ time }) => {
  return (
    // <Flex center>
    <div>
      {/* <TimerIcon /> */}
      <TimerStyle>{time}</TimerStyle>
    </div>
    // </Flex>
  );
};

export default Counter;
