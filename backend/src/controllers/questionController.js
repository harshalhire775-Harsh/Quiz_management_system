const Question = require('../models/questionModel');
const Quiz = require('../models/quizModel');

// @desc    Get questions by quiz ID
// @route   GET /api/questions/quiz/:quizId
// @access  Private
const getQuestionsByQuiz = async (req, res) => {
    const questions = await Question.find({ quiz: req.params.quizId });
    res.json(questions);
};

// @desc    Add a question to a quiz
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = async (req, res) => {
    const { quizId, questionText, options, correctAnswer, correctAnswers, type, explanation } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (quiz) {
        const question = new Question({
            quiz: quizId,
            questionText,
            options,
            correctAnswer,
            correctAnswers,
            type: type || 'MCQ',
            explanation
        });

        await question.save();

        // Update numQuestions in Quiz
        quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
        await quiz.save();

        res.status(201).json(question);
    } else {
        res.status(404).json({ message: 'Quiz not found' });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
    const { questionText, options, correctAnswer, explanation } = req.body;

    const question = await Question.findById(req.params.id);

    if (question) {
        question.questionText = questionText || questionText;
        question.options = options || question.options;
        question.correctAnswer = correctAnswer || question.correctAnswer;
        question.explanation = explanation || question.explanation;

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } else {
        res.status(404).json({ message: 'Question not found' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        const quizId = question.quiz;
        await question.deleteOne();

        // Update question count in Quiz
        const quiz = await Quiz.findById(quizId);
        if (quiz) {
            quiz.numQuestions = await Question.countDocuments({ quiz: quizId });
            await quiz.save();
        }

        res.json({ message: 'Question removed' });
    } else {
        res.status(404).json({ message: 'Question not found' });
    }
};

module.exports = {
    getQuestionsByQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
};
