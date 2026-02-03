import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Trophy,
    Calendar,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';

const ReviewQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resultsRes = await API.get('/results/myresults');
                const foundResult = resultsRes.data.find(r => r._id === id);

                if (!foundResult) throw new Error('Result not found');
                setResult(foundResult);

                if (foundResult.quiz) {
                    const quizId = typeof foundResult.quiz === 'object' ? foundResult.quiz._id : foundResult.quiz;
                    const questionsRes = await API.get(`/questions/quiz/${quizId}`);
                    setQuestions(questionsRes.data);
                }
            } catch (error) {
                console.error('Failed to load review data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="mt-4 text-indigo-600 font-bold text-center">Loading Review...</div>
            </div>
        </div>
    );

    if (!result || !questions.length) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border border-slate-100 max-w-md w-full">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={40} className="text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Review Unavailable</h3>
                <p className="text-slate-500 mb-8 font-medium">
                    {!result?.quiz
                        ? "The quiz associated with this result has been removed."
                        : "Unable to load questions for this attempt."}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Go Back
                </button>
            </div>
        </div>
    );

    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const isPassed = percentage >= 40;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-8 shadow-lg shadow-indigo-100 border border-slate-100 overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-2 transition-colors"
                                >
                                    <ArrowLeft size={18} /> Back to Results
                                </button>
                                <h1 className="text-3xl font-black text-slate-800">
                                    {result.quiz?.title || result.quizTitle || 'Unknown Quiz'}
                                </h1>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        {new Date(result.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="uppercase tracking-wider">Review Mode</span>
                                </div>
                            </div>

                            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 ${isPassed ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                <div className={`p-3 rounded-xl ${isPassed ? 'bg-emerald-200/50' : 'bg-rose-200/50'}`}>
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <div className="text-3xl font-black">{percentage}%</div>
                                    <div className="text-xs font-bold uppercase opacity-80">{isPassed ? 'Passed' : 'Failed'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase">Score</span>
                                <div className="text-xl font-black text-slate-800">{result.score} / {result.totalQuestions}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-600 uppercase">Correct</span>
                                <div className="text-xl font-black text-emerald-700">{result.correctAnswers}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                <span className="text-xs font-bold text-rose-600 uppercase">Incorrect</span>
                                <div className="text-xl font-black text-rose-700">{result.totalQuestions - result.correctAnswers}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <span className="text-xs font-bold text-indigo-600 uppercase">Total Qs</span>
                                <div className="text-xl font-black text-indigo-700">{result.totalQuestions}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Questions List */}
                <div className="space-y-6">
                    {questions.map((q, index) => {
                        const userAnswerObj = result.answers.find(ans => {
                            const ansQId = typeof ans.question === 'object' ? ans.question._id : ans.question;
                            return ansQId === q._id;
                        });
                        const userSelected = userAnswerObj ? userAnswerObj.selectedAnswer : null;
                        const isCorrect = userSelected === q.correctAnswer;
                        const isSkipped = !userSelected;

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={q._id}
                                className={`bg-white rounded-[2rem] p-8 shadow-sm border-2 transition-all ${isCorrect ? 'border-emerald-100 shadow-emerald-100' :
                                        isSkipped ? 'border-slate-100' :
                                            'border-rose-100 shadow-rose-100'
                                    }`}
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' :
                                            isSkipped ? 'bg-slate-100 text-slate-500' :
                                                'bg-rose-100 text-rose-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-800 leading-relaxed">{q.questionText}</h3>
                                        <div className="mt-2 text-sm font-medium">
                                            {isCorrect && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16} /> Correct Answer</span>}
                                            {isSkipped && <span className="text-slate-400 flex items-center gap-1"><HelpCircle size={16} /> Skipped</span>}
                                            {!isCorrect && !isSkipped && <span className="text-rose-500 flex items-center gap-1"><XCircle size={16} /> Incorrect Answer</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pl-0 md:pl-14">
                                    {q.options.map((option, optIndex) => {
                                        const isUserChoice = userSelected === option;
                                        const isCorrectChoice = q.correctAnswer === option;

                                        let cardClass = "bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-300";
                                        let icon = null;

                                        if (isUserChoice && isCorrectChoice) {
                                            cardClass = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-200 ring-offset-2";
                                            icon = <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />;
                                        } else if (isUserChoice && !isCorrectChoice) {
                                            cardClass = "bg-rose-50 border-rose-500 text-rose-800 font-bold ring-2 ring-rose-200 ring-offset-2";
                                            icon = <XCircle size={20} className="text-rose-500 flex-shrink-0" />;
                                        } else if (isCorrectChoice) {
                                            cardClass = "bg-emerald-50/50 border-emerald-200 text-emerald-800 font-medium border-dashed";
                                            icon = <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />;
                                        }

                                        return (
                                            <div
                                                key={optIndex}
                                                className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition-all ${cardClass}`}
                                            >
                                                <span>{option}</span>
                                                {icon}
                                            </div>
                                        );
                                    })}
                                </div>

                                {q.explanation && (
                                    <div className="mt-6 ml-0 md:ml-14 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm text-indigo-800">
                                        <span className="font-bold block mb-1">Explanation:</span>
                                        {q.explanation}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReviewQuiz;
