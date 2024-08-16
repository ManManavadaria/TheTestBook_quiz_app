const PendingRegistration = require('../models/PendingRegistration.model');
const User = require('../models/User.model');
const PendingSignIn = require('../models/PendingSignIn.model');
const School = require('../models/School.model');
const OTP = require('../models/Otp.model');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

async function sendOTP(otp, phoneNumber) {
  try {
    const fast2smsResponse = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      variables_values: otp.toString(),
      route: 'otp',
      numbers: phoneNumber
    }, {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY
      }
    });

    if (fast2smsResponse.data.return === false) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return false;
  }
}

exports.register = async (req, res) => {
  try {
    const { name, phoneNumber, schoolName, className } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists. Please sign in.', redirect: '/signin' });
    }

    // Find or create school
    let school = await School.findOne({ schoolName });
    if (!school) {
      school = new School({ schoolName });
      await school.save();
    }

    // Generate userId
    const schoolInitials = schoolName.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    const classInitial = className.trim().charAt(0);
    const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 6);
    const userId = `${schoolInitials}_${classInitial}_${uniqueCode}`;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create pending registration record
    const pendingRegistration = new PendingRegistration({
      userId,
      name,
      phoneNumber,
      school: school._id,
      class: className,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    });

    await pendingRegistration.save();

    // Send OTP
    const otpSent = await sendOTP(otp, phoneNumber);
    if (!otpSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.status(200).json({ message: 'OTP sent successfully. Please verify to complete registration.', userId });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
  }
};

exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    const pendingRegistration = await PendingRegistration.findOne({ userId });
    if (!pendingRegistration) {
      return res.status(400).json({ message: 'No pending registration found. Please register first.' });
    }

    if (otp !== pendingRegistration.otp || Date.now() > pendingRegistration.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    // Create user
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId: pendingRegistration.userId,
        name: pendingRegistration.name,
        phoneNumber: pendingRegistration.phoneNumber,
        school: pendingRegistration.school,
        class: pendingRegistration.class,
        accessLevel: pendingRegistration.accessLevel
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user.userId, accessLevel: user.accessLevel },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    await PendingRegistration.deleteOne({ userId });

    res.status(200).json({
      message: 'OTP verified successfully.',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        phoneNumber: user.phoneNumber,
        school: user.school,
        class: user.class,
        accessLevel: user.accessLevel
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error.message);
    res.status(500).json({ message: 'An error occurred during OTP verification. Please try again.' });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if the user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please check your userId.' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    await PendingSignIn.findOneAndUpdate(
      { userId },
      { otp, otpExpiry: Date.now() + 10 * 60 * 1000 }, // OTP expires in 10 minutes
      { upsert: true, new: true }
    );

    // Send OTP
    const otpSent = await sendOTP(otp, user.phoneNumber);
    if (!otpSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.status(200).json({
      message: 'OTP sent successfully. Please verify to complete sign-in.',
      userId
    });

  } catch (error) {
    console.error('Sign-in error:', error.message);
    res.status(500).json({ message: 'An error occurred during sign-in. Please try again.' });
  }
};

exports.verifySignInOTP = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    // Check if there is a pending sign-in record
    const pendingSignIn = await PendingSignIn.findOne({ userId });
    if (!pendingSignIn) {
      return res.status(400).json({ message: 'No pending sign-in found. Please initiate sign-in again.' });
    }

    if (otp !== pendingSignIn.otp || Date.now() > pendingSignIn.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    const user = await User.findOne({ userId: pendingSignIn.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please contact support.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, accessLevel: user.accessLevel },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '1d' }
    );

    // Clear the pending sign-in record
    await PendingSignIn.deleteOne({ userId });

    res.status(200).json({
      message: 'Sign-in successful.',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        phoneNumber: user.phoneNumber,
        school: user.school,
        class: user.class,
        accessLevel: user.accessLevel
      }
    });

  } catch (error) {
    console.error('Sign-in OTP verification error:', error.message);
    res.status(500).json({ message: 'An error occurred during sign-in verification. Please try again.' });
  }
};
