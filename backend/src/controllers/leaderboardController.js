const Result = require('../models/resultModel');

// @desc    Get leaderboard
// @route   GET /api/results/leaderboard
// @access  Public (or Private)
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Result.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalScore: { $sum: '$score' },
                    totalAttempts: { $count: {} },
                    avgPercentage: {
                        $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] }
                    }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    name: '$userDetails.name',
                    totalScore: 1,
                    totalAttempts: 1,
                    avgPercentage: { $round: ['$avgPercentage', 2] }
                }
            }
        ]);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Leaderboard error' });
    }
};

module.exports = { getLeaderboard };
