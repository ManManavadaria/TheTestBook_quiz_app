import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function Cards({ item }) {
  const navigate = useNavigate();

  console.log(item)
  const handleClick = () => {
    console.log(item);
    navigate('/test', { state: { test: item } });
  };

  return (
    <div
      className="my-1 p-3 sm:w-[50%] "
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabIndex={0}
    >
      <div
        className="p-3 border border-gray-300 card w-92 shadow-xl hover:scale-105 duration-200 bg-base-100 bg-white text-black dark:bg-slate-800 dark:text-white dark:border cursor-pointer"
      >
        {item.testName}
      </div>
    </div>
  );
}

Cards.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    testName: PropTypes.string.isRequired
  }).isRequired
};

export default Cards;
