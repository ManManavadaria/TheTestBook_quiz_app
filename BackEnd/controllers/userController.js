    // controllers/userController.js
    const User = require('../models/User.model');
    const Test = require('../models/Test.model');
    const School = require('../models/School.model');
    const Class = require('../models/Class.model')
    const GivenTest = require('../models/Giventest.model')
    const jwt = require('jsonwebtoken'); // Ensure jwt is imported

    exports.getUserById = async (req, res) => {
        try {
            const user = req.user;

            // Handle case where user might be undefined
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const token = jwt.sign(
                { userId: user.userId, accessLevel: user.accessLevel }, // Include only necessary user data in the token
                process.env.JWT_SECRET || 'default_secret', // Provide a default secret for development
                { expiresIn: process.env.JWT_EXPIRY || '1d' }
            );
            console.log(token)
            res.status(200).json({ user, token });
        } catch (error) {
            console.error('Error in getUserById:', error); // Log the error for debugging
            res.status(500).json({ message: 'Server error' });
        }
    };


    exports.getAllSchools = async (req, res) => {
        try {
            const schools = await School.find()
            res.status(200).json({ schools })
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    };

    exports.updateUserById = async (req,res)=>{
        try {
            const {user} = req.body;
            const id = req.user._id
            console.log(user)
    
            const updatedUser = await User.findByIdAndUpdate(id,user);
            res.status(200).json({ updatedUser });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    exports.getPopulatedUser = async (req, res) => {
        try {
            const id = req.user._id; // Assuming req.user contains the user's ID
        
            // Fetch user and populate 'allowedTests' and 'givenTests' with sorting
            const user = await User.findById(id)
                .populate({
                    path: 'allowedTests',
                    model: 'Test'
                })
                .populate({
                    path: 'givenTests',
                    model: 'GivenTest',
                    options: { sort: { createdAt: -1 } } // Sort by 'createdAt' in ascending order
                });
    
            console.log(user)
        
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        
            res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ message: 'Internal server error' });
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
            const { id, testId, testName,answers, totalTimeTaken } = req.body;

            console.log(id, testId, answers);
            console.log("totalTimeTaken ====>",totalTimeTaken)
            
            // Find the user
            const user = await User.findById(id);
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
                user: user._id, // note change the id in this get from req.id update user and add the givenTest id
                test: test._id,
                testName: testName,
                score,
                answers: givenAnswers,
                status: 'completed', // Assuming the status is completed when submitted
                totalTimeTaken: totalTimeTaken // Assuming totalTimeTaken is sent in the request
            });

            // Save the given test
            await givenTest.save();

            // Update the user's givenTests array
            user.givenTests.push(givenTest._id);
            await user.save();

            console.log(givenTest);

            res.status(200).json({ message: 'Test submitted successfully', givenTest });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };


    exports.getGivenTestByID = async (req, res) => {
        try {
            const { id } = req.body;

            console.log(id)
            // Find the given test by ID and populate user and test references
            const givenTest = await GivenTest.findById(id)
                .populate('user')
                .populate('test');

            console.log(givenTest)

            if (!givenTest) {
                return res.status(404).json({ message: 'Given test not found' });
            }

            res.status(200).json({ givenTest });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };


    exports.getAllClasses = async (req, res) => {
        try {
            const classes = await Class.find();
            res.status(200).json({ message: "Classes retrieved successfully", classes });
        } catch (error) {
            console.error("Error retrieving classes:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };    










