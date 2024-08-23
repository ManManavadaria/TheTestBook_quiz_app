import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "simple-datatables";
import AdminNavbar from "./AdminNavbar";

function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      // Fetch feedbacks from API
      axios.get(`${import.meta.env.VITE_API_URL}/admin/feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setFeedbacks(response.data))
      .catch((error) => console.error("Error fetching feedbacks:", error));
    }
  }, [token]);

  useEffect(() => {
    if (feedbacks.length > 0) {
      const table = document.querySelector("#feedbackTable");
      new DataTable(table);
    }
  }, [feedbacks]);

  return (
    <>
      <AdminNavbar />
      <div className="width-full h-full mx-auto mt-16 pt-5">
        <table id="feedbackTable" className="min-w-full bg-white text-black dark:bg-gray-800 dark:text-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b w-1/6">User</th>
              <th className="py-2 px-4 border-b w-1/6">Test</th>
              <th className="py-2 px-4 border-b w-4/6">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr key={feedback._id}>
                <td className="py-2 px-4 border-b truncate">{feedback.userId?.userId || 'Unknown'}</td>
                <td className="py-2 px-4 border-b truncate">{feedback.testId?.testName || 'Unknown'}</td>
                <td className="py-2 px-4 border-b break-words">{feedback.feedbackText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Feedbacks;
