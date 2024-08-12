const PendingRegistration = require('../models/PendingRegistration.model');
const User = require('../models/User.model');
const PendingSignIn = require('../models/PendingSignIn.model')
const School = require('../models/School.model');
const OTP = require('../models/Otp.model'); // Assuming you have an OTP model
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');


 async function sendOTP(otp, phoneNumber) {
        // Send OTP to user's phone number using Fast2SMS
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
        return false
    }    
    return true
}


exports.register = async (req, res) => {
  try {
    const { name, phoneNumber, schoolName, className } = req.body;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists. Please sign in.', redirect: '/signin' });
    }

    let school = await School.findOne({ schoolName });
    if (!school) {
      school = new School({ schoolName });
      await school.save();
    }

    const schoolInitials = schoolName.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    const classInitial = className.trim().charAt(0);
    const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 6);
    
    const userId = `${schoolInitials}_${classInitial}_${uniqueCode}`;

    const otp = Math.floor(100000 + Math.random() * 900000);

    const pendingRegistration = new PendingRegistration({
      userId,
      name,
      phoneNumber,
      school: school._id,
      class: className,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    });

    console.log(pendingRegistration)

    await pendingRegistration.save();

    // sendOTP(otp,phoneNumber)

    res.status(200).json({ message: 'OTP sent successfully. Please verify to complete registration.', userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
  }
};

exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    const pendingRegistration = await PendingRegistration.findOne({ userId: userId });
    if (!pendingRegistration) {
      return res.status(400).json({ message: 'No pending registration found. Please register first.' });
    }

    if (otp !== pendingRegistration.otp || Date.now() > pendingRegistration.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

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
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'An error occurred during OTP verification. Please try again.' });
  }
};


exports.signIn = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log(userId);

    // Check if the user exists
    const user = await User.findOne({ userId: userId });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please check your userId.' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP and user ID in MongoDB
    await PendingSignIn.findOneAndUpdate(
      { userId },
      { otp, otpExpiry: Date.now() + 10 * 60 * 1000 }, // OTP expires in 10 minutes
      { upsert: true, new: true }
    );

    console.log(otp)

    // Send OTP to user via SMS or other means (function not shown here)
    // var ok = sendOTP(otp, user.phoneNumber);
    // if (!ok) {
    //   return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    // }

    res.status(200).json({
      message: 'OTP sent successfully. Please verify to complete sign-in.',
      userId,
      otp // Remove this in production, as you should not expose OTP
    });

  } catch (error) {
    console.error('Sign-in error:', error);
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

    // Check if OTP is correct and not expired
    if (otp !== pendingSignIn.otp || Date.now() > pendingSignIn.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    // Fetch the user
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
    console.error('Sign-in OTP verification error:', error);
    res.status(500).json({ message: 'An error occurred during sign-in verification. Please try again.' });
  }
};


// // controllers/authController.js
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User.model');
// const School = require('../models/School.model');
// const OTP = require('../models/Otp.model');

// // Register a new user
// exports.register = async (req, res) => {
//   try {
//     const { name,phoneNumber,schoolname,classname } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ phoneNumber });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const existingSchool = await School.findOne({schoolName: schoolname})
//     if (existingSchool){
//         const schoolId = existingSchool._id
//     } else {
//         const schoolObj = {schoolName : schoolname}
//         newSchool = await School.insertOne(schoolObj);
//         console.log('Inserted new school:', newSchool.insertedId)
//         const schoolId = newSchool._id
//     }

//     id = 'madc534'
//     const newUser = new User({ userId: id,name: name, phoneNumber: phoneNumber, school: schoolId, class: classname, accessLevel: 'student'});
//     await newUser.save();

//     //generate otp
//     otp = 546123

//     const newOTP = new OTP({userId:newUser._id, otp:otp})


//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.verifyOTP = async (req,res)=>{
// try {

// } catch (error) {
    
// }
// }
// // Login a user
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check if the password matches
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Create a JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };
