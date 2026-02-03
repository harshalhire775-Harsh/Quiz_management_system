import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Edit, BookOpen, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';

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
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await API.delete(`/quizzes/${id}`);
                setQuizzes(quizzes.filter(q => q._id !== id));
            } catch (error) {
                alert('Failed to delete quiz');
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
                                className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${quiz.isPublished
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {quiz.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${quiz.isApproved
                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                            : 'bg-violet-50 text-violet-600 border-violet-100'
                                            }`}>
                                            {quiz.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/admin/quiz-results/${quiz._id}`}
                                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        title="View Results"
                                    >
                                        <FileText size={20} />
                                    </Link>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                                    {quiz.title}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                    {quiz.description || "No description provided."}
                                </p>

                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-50 mt-auto mb-4">
                                    <div className="text-center px-2 py-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50/50 transition-colors">
                                        <Clock size={16} className="mx-auto mb-1 text-slate-400 group-hover:text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-700 block">{quiz.duration}m</span>
                                    </div>
                                    <div className="text-center px-2 py-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50/50 transition-colors">
                                        <AlertCircle size={16} className="mx-auto mb-1 text-slate-400 group-hover:text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-700 block">{quiz.numQuestions} Qs</span>
                                    </div>
                                    <div className="text-center px-2 py-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50/50 transition-colors">
                                        <CheckCircle size={16} className="mx-auto mb-1 text-slate-400 group-hover:text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-700 block">{quiz.totalMarks} Pts</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to={`/admin/manage-quiz/${quiz._id}`}
                                        className="flex-1 py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                                        Manage
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(quiz._id)}
                                        className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Quiz"
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
