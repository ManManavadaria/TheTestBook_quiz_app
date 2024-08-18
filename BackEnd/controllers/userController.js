// controllers/userController.js
const User = require('../models/User.model');
const Test = require('../models/Test.model');
const School = require('../models/School.model');
const Class = require('../models/Class.model');
const GivenTest = require('../models/Giventest.model');
const jwt = require('jsonwebtoken'); // Ensure jwt is imported

exports.getUserById = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign(
            { userId: user.userId, accessLevel: user.accessLevel },
            process.env.JWT_SECRET || 'TheTestBook',
            { expiresIn: process.env.JWT_EXPIRY || '1d' }
        );
        res.status(200).json({ user, token });
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllSchools = async (req, res) => {
    try {
        const schools = await School.find();
        res.status(200).json({ schools });
    } catch (error) {
        console.error('Error retrieving schools:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateUserById = async (req, res) => {
    try {
        const { user } = req.body;
        const id = req.user._id;

        if (!user) {
            return res.status(400).json({ message: 'User data is required' });
        }

        if (user.school) {
            let school = await School.findOne({ schoolName: user.school });

            if (!school) {
                school = new School({ schoolName: user.school });
                await school.save();
            }

            // Assign the school ID to user.school
            user.school = school._id;
        }

        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPopulatedUser = async (req, res) => {
    try {
        const id = req.user._id;

        const user = await User.findById(id)
            .populate({
                path: 'allowedTests',
                model: 'Test'
            })
            .populate({
                path: 'givenTests',
                model: 'GivenTest',
                options: { sort: { createdAt: -1 } }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addTestToUsersBySchoolID = async (req, res) => {
    try {
        const { schoolId, testId } = req.body;

        if (!schoolId || !testId) {
            return res.status(400).json({ message: 'School ID and Test ID are required' });
        }

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const school = await School.findOne({ schoolId });
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const updatedUsers = await User.updateMany(
            { school: school._id },
            { $addToSet: { allowedTests: test._id } }
        );

        res.status(200).json({
            message: 'Test added to all users in the school successfully',
            updatedCount: updatedUsers.nModified
        });
    } catch (error) {
        console.error('Error adding test to users by school ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addTestToUsersByClassName = async (req, res) => {
    try {
        const { className, testId } = req.body;

        if (!className || !testId) {
            return res.status(400).json({ message: 'Class name and Test ID are required' });
        }

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const updatedUsers = await User.updateMany(
            { class: className },
            { $addToSet: { allowedTests: test._id } }
        );

        res.status(200).json({
            message: 'Test added to all users in the class successfully',
            updatedCount: updatedUsers.nModified
        });
    } catch (error) {
        console.error('Error adding test to users by class name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.submitGivenTest = async (req, res) => {
    try {
        const { id, testId, testName, answers, totalTimeTaken } = req.body;

        if (!id || !testId || !testName || !answers) {
            return res.status(400).json({ message: 'User ID, Test ID, Test Name, and Answers are required' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

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

        const givenTest = new GivenTest({
            user: user._id,
            test: test._id,
            testName: testName,
            score,
            answers: givenAnswers,
            status: 'completed',
            totalTimeTaken
        });

        await givenTest.save();

        user.givenTests.push(givenTest._id);
        await user.save();

        res.status(200).json({ message: 'Test submitted successfully', givenTest });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getGivenTestByID = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Given Test ID is required' });
        }

        const givenTest = await GivenTest.findById(id)
            .populate('user')
            .populate('test');

        if (!givenTest) {
            return res.status(404).json({ message: 'Given test not found' });
        }

        res.status(200).json({ givenTest });
    } catch (error) {
        console.error('Error fetching given test by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        res.status(200).json({ message: 'Classes retrieved successfully', classes });
    } catch (error) {
        console.error('Error retrieving classes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
