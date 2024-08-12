import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";

function UpdateProfile() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [userData, setUserData] = useState({});
  const [selectedClassName, setSelectedClassName] = useState(""); // State to handle the selected class name
  const token = localStorage.getItem("token");
  const theme = localStorage.getItem("theme") || "light"; // Get theme from localStorage

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = userResponse.data.user;
        setUserData(userData);
        setValue("name", userData.name);
        setValue("phoneNumber", userData.phoneNumber);

        // Fetch school list
        const schoolsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/schools`);
        const schoolOptions = schoolsResponse.data.schools.map((school) => ({
          value: school._id,
          label: school.schoolName,
        }));
        setSchools(schoolOptions);

        // Set the default school value
        const defaultSchool = schoolOptions.find(
          (school) => school.value === userData.school
        );
        if (defaultSchool) {
          setValue("school", defaultSchool);
        }

        // Fetch class list
        const classResponse = await axios.get(`${import.meta.env.VITE_API_URL}/classes`);
        const classOptions = classResponse.data.classes.map((classItem) => ({
          value: classItem._id,
          label: classItem.className,
        }));
        setClasses(classOptions);

        // Set the default class value
        const defaultClass = classOptions.find(
          (classOption) => classOption.label === userData.class
        );
        if (defaultClass) {
          setSelectedClassName(defaultClass.label); // Set the class name
          setValue("className", defaultClass.label); // Set the default value for className
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [setValue, token]);

  const onSubmit = async (data) => {
    // Find the class id based on the className
    const selectedClass = classes.find(
      (classItem) => classItem.label === data.className
    );

    const updatedInfo = {
      name: data.name,
      phoneNumber: data.phoneNumber,
      school: data.school.__isNew__ ? data.school.value : data.school.value,
      class: selectedClass ? selectedClass.label : "", // Send className instead of id
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/update-profile`, { user: updatedInfo }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Profile updated successfully");
      navigate("/profile");
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
      <div className={`w-[600px] ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-lg shadow-lg`}>
        <form onSubmit={handleSubmit(onSubmit)} method="dialog">
          <Link
            to="/"
            className={`btn btn-sm btn-circle btn-ghost absolute right-2 top-2 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            ✕
          </Link>

          <h3 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-black"}`}>Update Profile</h3>

          {/* Full Name */}
          <div className="mt-4 space-y-2">
            <span className={`${theme === "dark" ? "text-white" : "text-black"}`}>Full Name</span>
            <br />
            <input
              type="text"
              placeholder="Enter your full name"
              className={`w-full px-3 py-1 border rounded-md outline-none ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
              {...register("name", { required: true })}
            />
            <br />
            {errors.name && (
              <span className="text-sm text-red-500">This field is required</span>
            )}
          </div>

          {/* Phone Number */}
          <div className="mt-4 space-y-2">
            <span className={`${theme === "dark" ? "text-white" : "text-black"}`}>Phone Number</span>
            <br />
            <input
              type="tel"
              placeholder="Enter your phone number"
              className={`w-full px-3 py-1 border rounded-md outline-none ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
              {...register("phoneNumber", { required: true })}
              disabled
            />
            <br />
            {errors.phoneNumber && (
              <span className="text-sm text-red-500">This field is required</span>
            )}
          </div>

          {/* School Combobox */}
          <div className="mt-4 space-y-2">
            <span className={`${theme === "dark" ? "text-white" : "text-black"}`}>School</span>
            <br />
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
                  className={`w-full ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"}`}
                  styles={customStyles}
                  formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                />
              )}
            />
            {errors.school && (
              <span className="text-sm text-red-500">This field is required</span>
            )}
          </div>

          {/* Class Dropdown */}
          <div className="mt-4 space-y-2">
            <span className={`${theme === "dark" ? "text-white" : "text-black"}`}>Class</span>
            <br />
            <select
              className={`w-full px-3 py-1 border rounded-md outline-none ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
              {...register("className", { required: true })}
              value={selectedClassName}
              onChange={(e) => {
                setSelectedClassName(e.target.value);
                setValue("className", e.target.value);
              }}
            >
              <option value="">Select a class</option>
              {classes.map((classItem) => (
                <option key={classItem.value} value={classItem.label}>
                  {classItem.label}
                </option>
              ))}
            </select>
            <br />
            {errors.className && (
              <span className="text-sm text-red-500">This field is required</span>
            )}
          </div>

          {/* Button */}
          <div className="flex justify-around mt-4">
            <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;
