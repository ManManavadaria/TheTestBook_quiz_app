const User = require('../models/User.model');
const XLSX = require('xlsx');
const fs = require('fs');
const Test = require('../models/Test.model');
const { v4: uuidv4, v4 } = require('uuid');


exports.getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json({ allUsers });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserByID = async (req,res)=>{
    try {
        const {id} = req.body;
        const user = await User.findById(id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateUserById = async (req,res)=>{
    try {
        const {user} = req.body;

        //admin, super admin check is left to complete
        const updatedUuser = await User.findByIdAndUpdate(user._id,user);
        res.status(200).json({ updatedUuser });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteUserByID = async (req,res)=>{
    try {
        const {id} = req.body;
        const user = await User.findByIdAndRemove(id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.processTestExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { testName, subject} = req.body;

    if (!testName || !subject) {
        return res.status(400).json({ message: 'TestName or subject are required' });
    }

    try {
        // Read the Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Array to store questions
        const questions = [];

        var totalTestTime = 0;
        // Process each row
        for (const row of data) {
            try {
                validateRow(row);

                questions.push({
                    questionText: row.QuestionText,
                    options: [row.Option1, row.Option2, row.Option3, row.Option4],
                    correctAnswer: row.CorrectAnswer,
                    timeLimit: parseInt(row.TimeLimit)
                });
                
                totalTestTime += row.TimeLimit;
            } catch (error) {
                console.error(`Error processing row: ${JSON.stringify(row)}`, error);
                // You can choose to skip this row and continue, or handle the error differently
            }
        }

        const testId = uuidv4()

        // Save or update the test in the database
        const test = new Test(
            {
                testId: testId,
                testName: testName,
                subject: subject,
                totalTimeLimit: totalTestTime,
                questions: questions
            },
        );

        await test.save()

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Test data processed and saved successfully',
            test: {
                testId: test.testId,
                testName: test.testName,
                questionCount: test.questions.length
            }
        });
    } catch (error) {
        console.error('Error processing Excel:', error);
        res.status(500).json({ message: 'Error processing test data' });
    }
};

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

exports.getAllTests = async (req,res)=>{
    try {
        const Tests = await Test.find();
        res.status(200).json({ Tests });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getTestByID = async (req,res)=>{
    try {
        const {id} = req.body;
        const Test = await Test.findById(id);
        res.status(200).json({ Tests });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateTestByID = async (req,res)=>{
    try {
        const {test} = req.body;
        const Test = await Test.findByIdAndUpdate(test._id, test);
        res.status(200).json({"message":"Test updated successfully" ,Test });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteTestByID = async (req, res) => {
    try {
        const { id } = req.body;

        // Delete the test
        const deletedTest = await Test.findByIdAndRemove(id);
        if (!deletedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Remove testId from all users' allowedTests array
        await User.updateMany(
            { allowedTests: id },
            { $pull: { allowedTests: id } }
        );

        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};






