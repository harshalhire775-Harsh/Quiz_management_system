import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Search, Trophy, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';

const QuizResults = () => {
    const { id } = useParams(); // Quiz ID
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const [quizRes, resultsRes] = await Promise.all([
                    API.get(`/quizzes/${id}`),
                    API.get(`/results/quiz/${id}`) // Need backend endpoint for this
                ]);
                setQuiz(quizRes.data);
                setResults(resultsRes.data);
            } catch (error) {
                console.error('Failed to fetch results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    const filteredResults = results.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading Data...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 selection:text-indigo-900 pb-20 pt-10 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Button & Title */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div>
                        <button
                            onClick={() => navigate('/admin/quizzes')}
                            className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all mb-4 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 w-fit"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to My Quizzes
                        </button>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            {quiz?.title} <span className="text-indigo-600">Results</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pass Marks</span>
                            <span className="text-xl font-black text-slate-800">{quiz?.passingMarks}</span>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Marks</span>
                            <span className="text-xl font-black text-slate-800">{quiz?.totalMarks}</span>
                        </div>
                        <div className="bg-indigo-600 px-6 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Attempts</span>
                            <span className="text-xl font-black text-white">{results.length}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-4 items-center"
                >
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find student by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-600 outline-none bg-white text-slate-700 font-medium transition-all shadow-sm"
                        />
                    </div>
                </motion.div>

                {/* Table Area */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 uppercase tracking-widest text-[10px] font-black text-slate-400">
                                    <th className="px-8 py-6">Student Information</th>
                                    <th className="px-8 py-6">Score</th>
                                    <th className="px-8 py-6">Assessment Status</th>
                                    <th className="px-8 py-6">Submission Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                    <Search size={32} />
                                                </div>
                                                <p className="text-slate-500 font-bold">No results found for your query.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((result, idx) => {
                                        const isPassed = result.score >= quiz.passingMarks;

                                        return (
                                            <motion.tr
                                                key={result._id}
                                                className="hover:bg-slate-50/80 transition-all cursor-default group"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 * (idx % 10) }}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border border-slate-200 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                                                            {result.user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800 text-lg leading-none mb-1">{result.user.name}</div>
                                                            <div className="text-sm font-medium text-slate-400">{result.user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-2xl font-black text-slate-900 leading-none">{result.score}</span>
                                                        <span className="text-sm font-bold text-slate-300 mb-0.5">/ {quiz.totalMarks}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {isPassed ? (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-100">
                                                            <Trophy size={14} className="animate-bounce" /> Passed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest border border-rose-100">
                                                            <XCircle size={14} /> Failed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-slate-700 font-bold whitespace-nowrap">
                                                            <Clock size={16} className="text-slate-400" />
                                                            {new Date(result.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 mt-1 ml-6 uppercase">
                                                            {new Date(result.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default QuizResults;
