import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Edit, BookOpen, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const MyQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data } = await API.get('/quizzes/my-quizzes');
                setQuizzes(data);
            } catch (error) {
                console.error('Failed to fetch quizzes', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleDelete = async (id) => {
        const isConfirmed = await showConfirmAlert(
            'Delete Quiz?',
            'Are you sure you want to delete this quiz? This will also delete all associated questions.'
        );

        if (isConfirmed) {
            try {
                await API.delete(`/quizzes/${id}`);
                setQuizzes(quizzes.filter(q => q._id !== id));
                showSuccessAlert('Deleted!', 'Quiz deleted successfully');
            } catch (error) {
                showErrorAlert('Failed!', 'Failed to delete quiz');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans selection:bg-indigo-500/30 selection:text-indigo-900">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 mb-2">
                            My Quizzes
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">
                            Manage and track your assessments
                        </p>
                    </div>

                </motion.div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center p-16 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]"
                        >
                            <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                <BookOpen size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-3">No Quizzes Yet</h3>
                            <p className="text-slate-500 text-lg max-w-md mx-auto mb-10 leading-relaxed">
                                You haven't created any quizzes. Click the button below to start creating engaging assessments for your students.
                            </p>
                            <Link
                                to="/admin/create-quiz"
                                className="px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/20"
                            >
                                Get Started
                            </Link>
                        </motion.div>
                    ) : (
                        quizzes.map((quiz, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={quiz._id}
                                className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden relative"
                            >
                                {/* Header Info */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${quiz.isPublished
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${quiz.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                            {quiz.isPublished ? 'Live' : 'Draft'}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${quiz.isApproved
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                            {quiz.isApproved ? 'Verified' : 'Pending'}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/admin/quiz-results/${quiz._id}`}
                                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        title="Analytics"
                                    >
                                        <FileText size={18} />
                                    </Link>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed h-10">
                                        {quiz.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Stats Grid - Clean & Minimal */}
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="flex-1 flex flex-col items-center justify-center py-4 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-indigo-100 group-hover:bg-white transition-all duration-300">
                                        <Clock size={16} className="text-slate-400 mb-1.5 group-hover:text-indigo-500" />
                                        <span className="text-xs font-black text-slate-700">{quiz.duration}m</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center py-4 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-indigo-100 group-hover:bg-white transition-all duration-300">
                                        <AlertCircle size={16} className="text-slate-400 mb-1.5 group-hover:text-indigo-500" />
                                        <span className="text-xs font-black text-slate-700">{quiz.numQuestions} Qs</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center py-4 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-indigo-100 group-hover:bg-white transition-all duration-300">
                                        <CheckCircle size={16} className="text-slate-400 mb-1.5 group-hover:text-indigo-500" />
                                        <span className="text-xs font-black text-slate-700">{quiz.totalMarks} Pt</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link
                                        to={`/admin/manage-quiz/${quiz._id}`}
                                        className="flex-[4] py-4 bg-slate-900 text-white hover:bg-indigo-600 font-black rounded-2xl transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/20"
                                    >
                                        <Edit size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                        Manage Quiz
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(quiz._id)}
                                        className="flex-1 py-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-rose-100 hover:border-rose-500 shadow-sm"
                                        title="Discard"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyQuizzes;
