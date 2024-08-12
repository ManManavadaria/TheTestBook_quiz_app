import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function OtpSignup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentID, otpType } = location.state || {};

  const [otp, setOtp] = useState('');
  const [studentId, setStudentId] = useState(studentID || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (otpType !== 'signup' && otpType !== 'login') {
      // Redirect to home page if otpType is not valid
      navigate('/');
    }
  }, [otpType, navigate]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    try {
      const url = otpType === 'signup' 
        ? `${import.meta.env.VITE_API_URL}/auth/register/verify-otp`
        : `${import.meta.env.VITE_API_URL}/auth/login/verify-otp`;

      const response = await axios.post(url, {
        userId: studentId,
        otp: otp
      });

      if (response.status === 200) {
        toast.success('OTP verified successfully');
        // Store the token in local storage
        localStorage.setItem('token', response.data.token);
        // Navigate to the root page
        navigate('/');
      }
    } catch (error) {
      toast.error('Error verifying OTP: ' + (error.response?.data?.message || error.message));
    }
  };

  const inputClassName = `w-full px-3 py-2 border rounded-md outline-none mb-4 text-center ${
    theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'
  }`;

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[400px] mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Enter OTP</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter Student ID"
            className={inputClassName}
            required
          />
          <input
            type="number"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit OTP"
            className={inputClassName}
            required
            maxLength={6}
          />
          <button 
            type="submit"
            className="w-full bg-pink-500 text-white rounded-md px-3 py-2 hover:bg-pink-700 duration-200"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}

export default OtpSignup;
