import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const theme = localStorage.getItem("theme") || "light"; // Get theme from localStorage

  const onSubmit = async (data) => {
    const userInfo = {
      userId: data.studentId,
    };
    await axios
      .post(`${import.meta.env.VITE_API_URL}/auth/login`, userInfo)
      .then((res) => {
        console.log(res.data);
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
      })
      .catch((err) => {
        if (err.response) {
          console.log(err);
          toast.error("Error: " + err.response.data.message);
          setTimeout(() => {}, 2000);
        }
      });
  };

  return (
    <div>
      <dialog
        id="my_modal_3"
        className={`modal ${theme === "dark" ? "dark" : ""}`}
      >
        <div
          className={`modal-box w-auto p-6 shadow-xl border-2 rounded-lg ${
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

            {/* Student ID */}
            <div className="mt-4 space-y-2">
              <span>Student ID</span>
              <br />
              <input
                type="text"
                placeholder="Enter your student ID"
                className={`w-[100%] px-3 py-1 border rounded-md outline-none ${
                  theme === "dark"
                    ? "bg-slate-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
                {...register("studentId", { required: true })}
              />
              <br />
              {errors.studentId && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>

            {/* Button */}
            <div className="flex justify-around mt-6">
              <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
                Login
              </button>
              <p>
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
