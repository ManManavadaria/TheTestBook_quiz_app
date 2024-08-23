import React from "react";
import banner from "../../public/Banner-removebg.webp";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function Banner() {
  const [authUser] = useAuth();

  return (
    <>
      <div className="h-full min-h-screen max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row my-10">
        <div className="w-full order-2 md:order-1 md:w-1/2 mt-12 md:mt-36">
          <div className="space-y-8">
            <h1 className="text-2xl md:text-4xl font-bold">
              Welcome to{" "}
              <span className="text-pink-500">The Test Book!!!</span>
            </h1>
            {authUser && authUser.userId && (
              <p className="text-lg md:text-xl font-medium">
                Your StudentID: <span className="text-pink-500">{authUser.userId}</span>
              </p>
            )}
            <p className="text-sm md:text-xl">
              Discover, learn, and have fun with our exciting quizzes. Challenge
              yourself and see how much you really know. Ready to get started?
              Dive into a world of questions and answers!
            </p>
          </div>
          <button className="btn mt-6 btn-secondary">
            <Link to="/tests">Get Started</Link>
          </button>
        </div>
        <div className="order-1 w-full mt-20 md:w-1/2">
          <img
            src={banner}
            className="md:w-[550px] md:h-[460px] md:ml-12"
            alt="Banner"
          />
        </div>
      </div>
    </>
  );
}

export default Banner;
