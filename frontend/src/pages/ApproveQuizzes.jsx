import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, FileText, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const ApproveQuizzes = () => {
    const navigate = useNavigate();
    const [pendingQuizzes, setPendingQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingQuizzes = async () => {
        try {
            const { data } = await API.get('/quizzes/pending');
            setPendingQuizzes(data);
        } catch (error) {
            console.error("Failed to fetch pending quizzes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingQuizzes();
    }, []);

    const handleApprove = async (id) => {
        const isConfirmed = await showConfirmAlert(
            'Approve Quiz?',
            'Are you sure you want to approve this quiz? It will go live immediately.'
        );
        if (isConfirmed) {
            try {
                await API.put(`/quizzes/${id}/approve`);
                setPendingQuizzes(prev => prev.filter(q => q._id !== id));
                showSuccessAlert('Approved!', 'Quiz Approved Successfully! 🟢');
            } catch (error) {
                showErrorAlert('Failed!', 'Approval Failed');
            }
        }
    };

    const handleReject = async (id) => {
        const isConfirmed = await showConfirmAlert(
            'Reject Quiz?',
            'Are you sure you want to REJECT (Delete) this quiz? This action cannot be undone.'
        );
        if (isConfirmed) {
            try {
                await API.delete(`/quizzes/${id}`);
                setPendingQuizzes(prev => prev.filter(q => q._id !== id));
                showSuccessAlert('Rejected!', 'Quiz Rejected and Deleted. 🔴');
            } catch (error) {
                showErrorAlert('Failed!', 'Rejection Failed');
            }
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Approvals</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Review and approve quizzes created by instructors</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {pendingQuizzes.map((quiz) => (
                        <motion.div
                            key={quiz._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    {quiz.category}
                                </span>
                                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                    <Clock size={14} />
                                    {quiz.duration} mins
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors">
                                {quiz.title}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                {quiz.description}
                            </p>

                            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mb-6">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {quiz.createdBy?.name?.charAt(0) || 'S'}
                                </div>
                                <span>by {quiz.createdBy?.name || 'Unknown Sir'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleReject(quiz._id)}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors"
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(quiz._id)}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <CheckCircle size={18} />
                                    Approve
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {pendingQuizzes.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <FileText size={64} className="mb-4 opacity-20" />
                    <h3 className="text-lg font-bold">No Pending Quizzes</h3>
                    <p>Good job! All quizzes have been reviewed.</p>
                </div>
            )}
        </div>
    );
};

export default ApproveQuizzes;
