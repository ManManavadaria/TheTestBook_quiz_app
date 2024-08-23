import React, { useEffect, useState } from "react";
import Cards from "./Cards";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Test() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getTests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("ID",res.data._id)
        setTests(res.data.allowedTests);
      } catch (error) {
        setError("Failed to fetch tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getTests();
  }, []);

  const handleCardClick = (test) => {
    navigate("/quiz", { state: { test } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-current border-t-transparent text-blue-600" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 text-center mt-28">
        <h1 className="text-2xl md:text-4xl text-red-500">{error}</h1>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-2xl h-screen container mx-auto md:px-20 p-6">
        <div className="mt-[4rem] items-center justify-center text-center">
          <h1 className="text-2xl md:text-4xl">
            We're delighted to have you{" "}
            <span className="text-pink-500">Here! :)</span>
          </h1>
          {/* <p className="mt-12">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Porro,
            assumenda? Repellendus, iste corrupti? Tempore laudantium
          </p> */}
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 sm:flex sm:row">
          {tests.length > 0 ? (
            tests.map((item) => (
              <Cards
                key={item.id}
                item={item}
                onClick={() => handleCardClick(item)}
              />
            ))
          ) : (
            <p className="text-center col-span-4">No tests available.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Test;
