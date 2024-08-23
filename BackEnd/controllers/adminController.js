const User = require('../models/User.model');
const XLSX = require('xlsx');
const fs = require('fs');
const Test = require('../models/Test.model');
const School = require('../models/School.model');
const Class = require('../models/Class.model');
const Feedback = require('../models/Feedback.model')
const GivenTest = require('../models/Giventest.model');
const { v4: uuidv4 } = require('uuid');

// Utility function to send a consistent server error response
const handleServerError = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({ message });
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json({ allUsers });
    } catch (error) {
        handleServerError(res, error, 'Failed to fetch users');
    }
};

// Get a populated user by userId
exports.getPopulatedUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findOne({ userId: userId })
            .populate({
                path: 'allowedTests',
                model: 'Test',
                options: { sort: { name: 1 } } // Optional: example of sorting
            })
            .populate({
                path: 'givenTests',
                model: 'GivenTest',
                options: { sort: { createdAt: -1 } } // Optional: example of sorting
            });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        handleServerError(res, error, 'Failed to fetch populated user');
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, phoneNumber, schoolId, className } = req.body;

        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolInitials = school.schoolName.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
        const classInitial = className.trim().charAt(0);
        const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 4);
        const userId = `${schoolInitials}-${classInitial}-${uniqueCode}`;

        const newUser = new User({
            userId,
            name,
            phoneNumber,
            school: school._id,
            class: className,
            accessLevel: 'student',
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        handleServerError(res, error, 'Failed to create user');
    }
};

// Get a user by ID
exports.getUserByID = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        handleServerError(res, error, 'Failed to fetch user by ID');
    }
};

// Update a user by ID
exports.updateUserById = async (req, res) => {
    try {
        const { user } = req.body;

        const updatedUser = await User.findByIdAndUpdate(user.id, user, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
        handleServerError(res, error, 'Failed to update user');
    }
};

// Delete a user by userId
exports.deleteUserByID = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOneAndDelete({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        handleServerError(res, error, 'Failed to delete user');
    }
};

// Process and save a test from an Excel file
exports.processTestExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { testName, subject, isDummy } = req.body;

    if (!testName || !subject) {
        return res.status(400).json({ message: 'TestName and subject are required' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const questions = [];
        let totalTestTime = 0;

        for (const row of data) {
            try {
                validateRow(row);

                questions.push({
                    questionText: row.QuestionText,
                    options: [row.Option1, row.Option2, row.Option3, row.Option4],
                    correctAnswer: row.CorrectAnswer,
                    timeLimit: parseInt(row.TimeLimit),
                });

                totalTestTime += parseInt(row.TimeLimit);
            } catch (error) {
                console.error(`Error processing row: ${JSON.stringify(row)}`, error);
            }
        }

        const test = new Test({
            testId: uuidv4(),
            testName,
            subject,
            totalTimeLimit: totalTestTime,
            questions,
            isDummy,
        });

        await test.save();

        if (isDummy) {
            await User.updateMany({}, { $push: { allowedTests: test._id } });
        }

        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Test data processed and saved successfully',
            test: {
                testId: test.testId,
                testName: test.testName,
                questionCount: test.questions.length,
            },
        });
    } catch (error) {
        handleServerError(res, error, 'Failed to process test data');
    }
};

// Validate a row of test data
function validateRow(row) {
    const requiredFields = ['QuestionText', 'Option1', 'Option2', 'Option3', 'Option4', 'CorrectAnswer', 'TimeLimit'];
    for (const field of requiredFields) {
        if (!row[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    if (isNaN(parseInt(row.TimeLimit))) {
        throw new Error(`Invalid TimeLimit: ${row.TimeLimit}`);
    }
}

// Get all tests
exports.getAllTests = async (req, res) => {
    try {
        const Tests = await Test.find();
        res.status(200).json({ Tests });
    } catch (error) {
        handleServerError(res, error, 'Failed to fetch tests');
    }
};

// Get a test by ID
exports.getTestByID = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findById(testId);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ test });
    } catch (error) {
        handleServerError(res, error, 'Failed to fetch test by ID');
    }
};

// Update a test by ID
exports.updateTestByID = async (req, res) => {
    try {
        const { test, id } = req.body;

        if (!test || !id) {
            return res.status(400).json({ message: 'Invalid test data provided' });
        }

        test.totalTimeLimit = test.questions.reduce((total, question) => total + Number(question.timeLimit), 0);

        const updatedTest = await Test.findByIdAndUpdate(id, test, { new: true });

        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.status(200).json({ message: 'Test updated successfully', updatedTest });
    } catch (error) {
        handleServerError(res, error, 'Failed to update test');
    }
};

// Delete a test by ID
exports.deleteTestByID = async (req, res) => {
    try {
        const { id } = req.body;

        const deletedTest = await Test.findByIdAndRemove(id);
        if (!deletedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }

        await User.updateMany({ allowedTests: id }, { $pull: { allowedTests: id } });

        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        handleServerError(res, error, 'Failed to delete test');
    }
};

exports.allowtest = async (req, res) => {
    try {
        const { testId, schoolId, className, userId } = req.body;

        if (!testId) {
            return res.status(400).json({ message: "Test ID is required." });
        }

        let userIds = [];

        if (schoolId && className) {
            const users = await User.find({ school: schoolId, class: className });
            if (!users.length) {
                return res.status(404).json({ message: "No students found in the selected school and class." });
            }
            userIds = users.map((user) => user.userId);
        } else if (schoolId) {
            const users = await User.find({ school: schoolId });
            if (!users.length) {
                return res.status(404).json({ message: "No students found in the selected school." });
            }
            userIds = users.map((user) => user.userId);
        } else if (userId) {
            userIds = [userId];
        } else {
            return res.status(400).json({ message: "Please select a school, class, or user to allow the test." });
        }

        const updateResult = await User.updateMany(
            { userId: { $in: userIds } },
            { $addToSet: { allowedTests: testId } }
        );

        if (updateResult.nModified === 0) {
            return res.status(400).json({ message: "No users were updated with the allowed test." });
        }

        res.status(200).json({
            message: `Test ${testId} allowed for selected users.`,
            updatedCount: updateResult.nModified,
        });
    } catch (error) {
        console.error("Error allowing test:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

exports.addTestToUser = async (req, res) => {
    try {
        const { userId, testId } = req.body;

        if (!userId || !testId) {
            return res.status(400).json({ message: 'User ID and Test ID are required' });
        }

        const test = await Test.findOne({ testId });

        if (!test) {
            console.error(`Test not found: ${testId}`);
            return res.status(404).json({ message: 'Test not found' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { $addToSet: { allowedTests: test._id } },
            { new: true }
        ).populate('allowedTests');

        if (!updatedUser) {
            console.error(`User not found: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Test added to user successfully', user: updatedUser });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getGivenTestsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const users = await User.find({ school: schoolId }).populate('givenTests');

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for the specified school' });
        }

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching given tests by school:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getGivenTestsByClass = async (req, res) => {
    try {
        const { className } = req.body;

        const users = await User.find({ class: className }).populate('givenTests');

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found in the specified class' });
        }

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching given tests by class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.AddSchool = async (req, res) => {
    const { schoolName } = req.body;

    try {
        if (!schoolName) {
            return res.status(400).json({ message: 'School name is required' });
        }

        const newSchool = new School({ schoolName });
        await newSchool.save();

        res.status(201).json({ message: 'School added successfully', school: newSchool });
    } catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteSchool = async (req, res) => {
    const { schoolId } = req.params;

    try {
        const deletedSchool = await School.findByIdAndDelete(schoolId);

        if (!deletedSchool) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({ message: 'School deleted successfully' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.editSchool = async (req, res) => {
    const { schoolId } = req.params;
    const { schoolName } = req.body;

    try {
        if (!schoolName) {
            return res.status(400).json({ message: 'School name is required' });
        }

        const updatedSchool = await School.findByIdAndUpdate(
            schoolId,
            { schoolName },
            { new: true }
        );

        if (!updatedSchool) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({ message: 'School updated successfully', school: updatedSchool });
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addClass = async (req, res) => {
    try {
        const { className } = req.body;

        if (!className) {
            return res.status(400).json({ message: "Class name is required" });
        }

        const newClass = new Class({ className });
        await newClass.save();

        res.status(201).json({ message: "Class added successfully", class: newClass });
    } catch (error) {
        console.error("Error adding class:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.editClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { className } = req.body;

        if (!className) {
            return res.status(400).json({ message: "Class name is required" });
        }

        const updatedClass = await Class.findByIdAndUpdate(classId, { className }, { new: true });

        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json({ message: "Class updated successfully", class: updatedClass });
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;

        const deletedClass = await Class.findByIdAndDelete(classId);

        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate({
                path: 'userId',
                select: 'userId', // Specify fields to include from User
                model: User
            })
            .populate({
                path: 'testId',
                select: 'testName', // Specify fields to include from Test
                model: Test
            })
            .exec();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
    }
};
