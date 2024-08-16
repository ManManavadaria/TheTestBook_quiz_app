import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";

function Signup() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const theme = localStorage.getItem("theme") || "light"; // Get theme from localStorage

  useEffect(() => {
    // Fetch school list
    axios
      .get(`${import.meta.env.VITE_API_URL}/schools`)
      .then((res) => {
        const schoolOptions = res.data.schools.map((school) => ({
          value: school.schoolName,
          label: school.schoolName,
        }));
        setSchools(schoolOptions);
      })
      .catch((err) => console.error("Error fetching schools:", err));

    // Fetch class list
    axios
      .get(`${import.meta.env.VITE_API_URL}/classes`) // Assuming your API endpoint is "/api/classes"
      .then((res) => {
        const classOptions = res.data.classes.map((classItem) => ({
          value: classItem.className, // Extract className for use in option
          label: classItem.className, // Extract className for display
        }));
        setClasses(classOptions);
      })
      .catch((err) => console.error("Error fetching classes:", err));
  }, []);

  const onSubmit = async (data) => {
    const userInfo = {
      name: data.name,
      phoneNumber: data.phoneNumber,
      schoolName: data.school.__isNew__ ? data.school.value : data.school.label,
      className: data.className,
      otpType: "signup",
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, userInfo);
      if (res.data) {
        toast.success("OTP sent successfully");
        navigate("/otp-signup", {
          state: { studentID: res.data.userId, otpType: "signup" },
          replace: true,
        });
      }
    } catch (err) {
      if (err.response) {
        toast.error("Error: " + err.response.data.message);
      }
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1E293B" : "white",
      borderColor: theme === "dark" ? "#374151" : "#e2e8f0",
      borderRadius: "0.375rem",
      minHeight: "38px",
      boxShadow: state.isFocused ? "0 0 0 1px #e2e8f0" : "none",
      color: theme === "dark" ? "white" : "black",
      "&:hover": {
        borderColor: theme === "dark" ? "#374151" : "#e2e8f0",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#374151" : "white",
      color: theme === "dark" ? "white" : "black",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "white" : "black",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
      color: theme === "dark" ? "white" : "black",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      color: theme === "dark" ? "white" : "black",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? theme === "dark"
          ? "#4B5563"
          : "#f0f0f0"
        : theme === "dark"
          ? "#1E293B"
          : "white",
      color: theme === "dark" ? "white" : "black",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: theme === "dark" ? "white" : "black",
    }),
  };

  return (
    <div className={`flex h-screen items-center justify-center ${theme === "dark" ? "dark" : ""}`}>
      <div className="w-[600px]">
        <div className={`modal-box w-auto ${theme === "dark" ? "dark:bg-slate-800 dark:text-white" : "bg-white text-black"} p-6 shadow-xl border-2 rounded-lg`}>
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            <Link to="/" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </Link>
            <h3 className="font-bold text-lg">Signup</h3>

            <div className="mt-4 space-y-2">
              <span>Full Name</span>
              <input
                type="text"
                placeholder="Enter your full name"
                className={`w-[100%] px-3 py-1 border rounded-md outline-none ${theme === "dark" ? "bg-slate-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
                {...register("name", { required: true })}
              />
              {errors.name && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <span>Phone Number</span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className={`w-[100%] px-3 py-1 border rounded-md outline-none ${theme === "dark" ? "bg-slate-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
                {...register("phoneNumber", { required: true })}
              />
              {errors.phoneNumber && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <span>School</span>
              <Controller
                name="school"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CreatableSelect
                    {...field}
                    options={schools}
                    isClearable
                    isSearchable
                    placeholder="Select or type your school"
                    className="w-[100%]"
                    styles={customStyles}
                  />
                )}
              />
              {errors.school && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <span>Class</span>
              <select
                className={`w-[100%] px-3 py-1 border rounded-md outline-none ${theme === "dark" ? "bg-slate-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
                {...register("className", { required: true })}
              >
                <option value="">Select a class</option>
                {classes.map((classItem) => (
                  <option key={classItem.value} value={classItem.value}>
                    {classItem.label}
                  </option>
                ))}
              </select>
              {errors.class && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div className="flex justify-around mt-4">
              <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
                Signup
              </button>
              <p className="sm:text-xl text-base">
                Have account?{" "}
                <button
                  type="button"
                  className="underline text-blue-500 cursor-pointer"
                  onClick={() => navigate(-1)}
                >
                  Login
                </button>{" "}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
