import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [showFindId, setShowFindId] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues
  } = useForm();

  const theme = localStorage.getItem("theme") || "light"; // Get theme from localStorage

  const onSubmit = async (data) => {
    const userInfo = {
      userId: data.studentId,
    };
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, userInfo);
      if (res.data) {
        toast.success("OTP sent Successfully");
        navigate("/otp-signup", {
          state: {
            otpType: "login",
            studentID: res.data.userId,
          },
          replace: true,
        });
      }
    } catch (err) {
      toast.error("Error: " + (err.response?.data?.message || "An error occurred"));
    }
  };

  const handleFindUserId = async () => {
    const phoneNumber = getValues("phoneNumber").trim();
    if (!phoneNumber) {
      toast.error("Phone number is required.");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/find-user-id`, { phoneNumber });
      if (response.data && response.data.userId) {
        setValue("studentId", response.data.userId);
        toast.success("Student ID found! You can now log in.");
        setShowFindId(false);
      } else {
        toast.error("Student ID not found. Please sign up.");
      }
    } catch (error) {
      toast.error("Student ID not found. Please sign up.");
    }
  };

  return (
    <div>
      <dialog
        id="my_modal_3"
        className={`modal ${theme === "dark" ? "dark" : ""}`}
      >
        <div
          className={`modal-box m-6 p-6 shadow-xl border-2 rounded-lg ${
            theme === "dark"
              ? "dark:bg-slate-800 dark:text-white border-gray-700"
              : "bg-white text-black border-gray-300"
          }`}
        >
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            <Link
              to="/"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              ✕
            </Link>

            <h3 className="font-bold text-lg">Login</h3>

            {/* Find User ID Section */}
            {showFindId && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  className={`w-full px-3 py-2 border rounded-md outline-none ${
                    theme === "dark"
                      ? "bg-slate-700 text-white border-gray-600"
                      : "bg-white text-black border-gray-300"
                  }`}
                  {...register("phoneNumber", { required: true })}
                />
                <button
                  type="button"
                  onClick={handleFindUserId}
                  className={`w-full mt-2 bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 duration-200 ${
                    theme === "dark" ? "bg-blue-600" : ""
                  }`}
                >
                  Find My ID
                </button>
                {errors.phoneNumber && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>
            )}

            {/* Student ID */}
            <div className="mt-4 space-y-2">
              <span>Student ID</span>
              <input
                type="text"
                placeholder="Enter your student ID"
                className={`w-full px-3 py-2 border rounded-md outline-none ${
                  theme === "dark"
                    ? "bg-slate-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
                {...register("studentId", { required: true })}
              />
              {errors.studentId && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 mt-6">
              <button
                type="submit"
                className={`w-full bg-pink-500 text-white rounded-md px-4 py-2 hover:bg-pink-700 duration-200 ${
                  theme === "dark" ? "bg-pink-600" : ""
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowFindId((prev) => !prev)}
                className={`w-full bg-gray-500 text-white rounded-md px-4 py-2 hover:bg-gray-700 duration-200 ${
                  theme === "dark" ? "bg-gray-600" : ""
                }`}
              >
                {showFindId ? "Cancel" : "Find My ID"}
              </button>
              <p className="text-center">
                Not registered?{" "}
                <Link
                  to="/signup"
                  className="underline text-blue-500 cursor-pointer"
                >
                  Signup
                </Link>{" "}
              </p>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Login;
