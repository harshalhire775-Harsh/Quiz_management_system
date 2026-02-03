import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    History,
    Calendar,
    Award,
    Eye,
    CheckCircle,
    XCircle,
    Trophy,
    ArrowRight,
    ArrowLeft,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';

const MyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await API.get('/results/myresults');
                setResults(data);
            } catch (error) {
                console.error('Failed to fetch results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="mt-4 text-indigo-600 font-bold text-center">Loading History...</div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={container}
            className="space-y-8 max-w-5xl mx-auto"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">My Quiz History</h1>
                    <p className="text-slate-500 font-medium">Review your past performances and track your progress.</p>
                </div>
                <Link
                    to="/student-dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
            </motion.div>

            <AnimatePresence>
                {results.length === 0 ? (
                    <motion.div
                        variants={item}
                        className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100"
                    >
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <History size={40} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">No quizzes taken yet</h3>
                        <p className="text-slate-500 mb-6">Start your first quiz to begin your learning journey!</p>
                        <Link
                            to="/quizzes"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            Browse Quizzes <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {results.map((result) => {
                            const percentage = Math.round((result.score / result.totalQuestions) * 100);
                            const isPassed = percentage >= 40; // Assuming 40% is pass

                            return (
                                <motion.div
                                    key={result._id}
                                    variants={item}
                                    className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-50 transition-colors"></div>

                                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                        {/* Score Badge */}
                                        <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-4 ${isPassed
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : 'bg-rose-50 border-rose-100 text-rose-600'
                                            }`}>
                                            <span className="text-2xl font-black">{percentage}%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {isPassed ? 'Passed' : 'Failed'}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {result.quiz?.title || result.quizTitle || 'Unknown Quiz'}
                                            </h3>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={16} className="text-slate-400" />
                                                    {new Date(result.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Trophy size={16} className="text-slate-400" />
                                                    Score: {result.score}/{result.totalQuestions}
                                                </span>
                                                {(result.quiz?.category || result.quizCategory) && (
                                                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                        {result.quiz?.category || result.quizCategory}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <Link
                                            to={`/review/${result._id}`}
                                            className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Eye size={18} />
                                            Review Details
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyResults;
