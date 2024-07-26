// controllers/userController.js
const User = require('../models/User.model');
const Test = require('../models/Test.model');
const School = require('../models/School.model');

// Get user details by ID
exports.getUserById = async (req, res) => {
    try {
     res.status(200).json({user: req.user})
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addTestToUser = async (req, res) => {
  try {
      const { userId, testId } = req.body;

      // Check if the test exists
      const test = await Test.findById(testId);
      if (!test) {
          return res.status(404).json({ message: 'Test not found' });
      }

      // Update the user's allowedTests array
      const updatedUser = await User.findOneAndUpdate(
          { userId },
          { $addToSet: { allowedTests: test._id } },
          { new: true }
      ).populate('allowedTests'); // Populate to return updated tests

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Test added to user successfully', user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};



exports.addTestToUsersBySchoolID = async (req, res) => {
    try {
        const { schoolId, testId } = req.body;

        // Check if the test exists
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Find the school by schoolId to ensure it exists
        const school = await School.findOne({ schoolId });
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Update all users with the given schoolId to add the testId to allowedTests array
        const updatedUsers = await User.updateMany(
            { school: school._id },
            { $addToSet: { allowedTests: test._id } }
        );

        res.status(200).json({ message: 'Test added to all users in the school successfully', updatedCount: updatedUsers.nModified });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addTestToUsersByClassName = async (req, res) => {
  try {
      const { className, testId, totalTimeTaken } = req.body;

      // Check if the test exists
      const test = await Test.findById(testId);
      if (!test) {
          return res.status(404).json({ message: 'Test not found' });
      }

      // Update all users with the given className to add the testId to allowedTests array
      const updatedUsers = await User.updateMany(
          { class: className },
          { $addToSet: { allowedTests: testId } }
      );

      res.status(200).json({ message: 'Test added to all users in the class successfully', updatedCount: updatedUsers.nModified });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.submitGivenTest = async (req, res) => {
  try {
      const { userId, testId, answers } = req.body;

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Find the test
      const test = await Test.findById(testId);
      if (!test) {
          return res.status(404).json({ message: 'Test not found' });
      }

      // Calculate the score
      let score = 0;
      const givenAnswers = answers.map(answer => {
          const correctQuestion = test.questions.find(q => q.questionText === answer.questionText);
          const isCorrect = correctQuestion && correctQuestion.correctAnswer === answer.givenAnswer;
          if (isCorrect) {
              score++;
          }
          return {
              questionText: answer.questionText,
              givenAnswer: answer.givenAnswer,
              correctAnswer: correctQuestion ? correctQuestion.correctAnswer : null,
          };
      });

      // Create the given test object
      const givenTest = new GivenTest({
          user: user._id,
          test: test._id,
          score,
          answers: givenAnswers,
          status: 'completed', // Assuming the status is completed when submitted
          totalTimeTaken: totalTimeTaken // Assuming totalTimeTaken is sent in the request
      });

      // Save the given test
      await givenTest.save();

      res.status(200).json({ message: 'Test submitted successfully', givenTest });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.getGivenTestByID = async (req, res) => {
  try {
      const { givenTestId } = req.params;

      // Find the given test by ID and populate user and test references
      const givenTest = await GivenTest.findById(givenTestId)
          .populate('user')
          .populate('test');

      if (!givenTest) {
          return res.status(404).json({ message: 'Given test not found' });
      }

      res.status(200).json({ givenTest });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};








