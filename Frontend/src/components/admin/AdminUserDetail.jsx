import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { DataTable } from "simple-datatables";
import AdminNavbar from "./AdminNavbar";
import * as XLSX from "xlsx";

function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [userData, setUserData] = useState({});
  const [defaultClass, setDefaultClass] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/user-details/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userData = userResponse.data;
        setUserData(userData);
        setValue("name", userData.name);
        setValue("phoneNumber", userData.phoneNumber);
        setValue("accessLevel", userData.accessLevel);

        // Fetch school list
        const schoolsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/schools`
        );
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
        const classResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/classes` // Replace with your class API endpoint
        );
        const classOptions = classResponse.data.classes.map((classItem) => ({
          value: classItem._id,
          label: classItem.className,
        }));
        setClasses(classOptions);

        // Set the default class value
        const defaultClassOption = classOptions.find(
          (classOption) => classOption.label === userData.class
        );
        if (defaultClassOption) {
          setDefaultClass(defaultClassOption.label);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [setValue, userId, token]);

  const onSubmit = async (data) => {
    const updatedInfo = {
      id: userData._id,
      name: data.name,
      phoneNumber: data.phoneNumber,
      school: data.school.__isNew__ ? data.school.value : data.school.value,
      class: data.className,
      accessLevel: data.accessLevel,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/update-user`,
        { user: updatedInfo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Profile updated successfully");
    } catch (err) {
      if (err.response) {
        toast.error("Error: " + err.response.data.message);
      }
    }
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      userData.givenTests.map((test) => ({
        "Test Name": test.testName,
        Score: `${test.score} / ${test.answers.length}`,
        Date: new Date(test.createdAt).toUTCString(),
        Status: test.status,
        "Total Time Taken (mins)": test.totalTimeTaken,
        Answers: test.answers
          .map(
            (answer) =>
              `${answer.questionText}: Given Answer: ${answer.givenAnswer}, Correct Answer: ${answer.correctAnswer}`
          )
          .join(", "),
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, "GivenTests");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `GivenTests_${userId}.xlsx`;
    link.click();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/delete-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("User deleted successfully");
      navigate("/admin");
    } catch (err) {
      if (err.response) {
        toast.error("Error: " + err.response.data.message);
      }
    }
  };

  useEffect(() => {
    if (userData.givenTests) {
      const dataTable = new DataTable("#givenTestsTable");
      dataTable.update({
        data: {
          headings: ["Test Name", "Score", "Date"],
          data: userData.givenTests.map((test) => [
            test.testName,
            test.score,
            new Date(test.date).toUTCString(),
          ]),
        },
      });
    }
  }, [userData.givenTests]);

  // Custom styles for React Select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "#121212",
      borderColor: "#e2e8f0",
      borderRadius: "0.375rem",
      minHeight: "38px",
      boxShadow: state.isFocused ? "0 0 0 1px #e2e8f0" : "none",
      "&:hover": {
        borderColor: "#e2e8f0",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1f2937",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#f9fafb",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      color: "#f9fafb",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#4b5563" : "#1f2937",
      color: "#f9fafb",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: "#f9fafb",
    }),
  };

  return (
    <>
      <AdminNavbar />
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 mt-16">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            <h3 className="font-bold text-lg text-black dark:text-white mb-6">
              Update User Profile
            </h3>

            {/* Form Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <span className="text-black dark:text-white">Full Name</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("name", { required: true })}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <span className="text-black dark:text-white">Phone Number</span>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("phoneNumber", { required: true })}
                />
                {errors.phoneNumber && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* School Combobox */}
              <div className="space-y-2">
                <span className="text-black dark:text-white">School</span>
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
                      className="w-full bg-white dark:bg-gray-700 text-black dark:text-white"
                      styles={customStyles}
                      formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                    />
                  )}
                />
                {errors.school && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Class Dropdown */}
              <div className="space-y-2">
                <span className="text-black dark:text-white">Class</span>
                <select
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("className", { required: true })}
                  value={defaultClass}
                  onChange={(e) => setDefaultClass(e.target.value)}
                >
                  <option value="">Select a class</option>
                  {classes.map((classOption) => (
                    <option key={classOption.label} value={classOption.label}>
                      {classOption.label}
                    </option>
                  ))}
                </select>
                {errors.className && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Access Level */}
              <div className="space-y-2">
                <span className="text-black dark:text-white">Access Level</span>
                <select
                  className="w-full px-3 py-1 border rounded-md outline-none bg-white dark:bg-gray-700 text-black dark:text-white"
                  {...register("accessLevel", { required: true })}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="super admin">Super Admin</option>
                </select>
                {errors.accessLevel && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>
            </div>

            {/* Allowed Tests Cards */}
            <div className="mt-8">
              <h4 className="text-black dark:text-white font-semibold mb-4">
                Allowed Tests
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {userData.allowedTests &&
                  userData.allowedTests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center  justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
                    >
                      <span className="text-black dark:text-white">
                        {test.testName}
                      </span>
                      {/* <button
                        type="button"
                        onClick={() => handleRemoveAllowedTest(test.testId)}
                        className="text-red-500 hover:text-red-700"
                      > */}
                      {/* <i className="fas fa-minus-circle"></i> */}
                      {/* </button> */}
                    </div>
                  ))}
              </div>
            </div>

            {/* Given Tests Table */}
            <div className="mt-8">
              <h4 className="text-black dark:text-white font-semibold mb-4">
                Given Tests
              </h4>
              <div className="overflow-x-auto">
                <table
                  id="givenTestsTable"
                  className="w-full border-collapse bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Test Name</th>
                      <th className="border px-4 py-2">Score</th>
                      <th className="border px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.givenTests &&
                      userData.givenTests.map((test) => (
                        <tr key={test._id}>
                          <td className="border px-4 py-2">{test.testName}</td>
                          <td className="border px-4 py-2">
                            {test.score} / {test.answers.length}
                          </td>
                          <td className="border px-4 py-2">
                            {new Date(test.createdAt).toUTCString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
              >
                Update Profile
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600"
              >
                Delete User
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
              >
                Download Submitted Tests as XLSX
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminUserDetail;
