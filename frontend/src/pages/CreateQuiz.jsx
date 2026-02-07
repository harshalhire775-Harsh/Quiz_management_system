import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Clock, Award, CheckCircle, AlertCircle, Type, AlignLeft, Grid, Sparkles, Zap, Layers, Calendar, Upload, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import API from '../api/axios';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const CreateQuiz = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        duration: 30,
        totalMarks: 100,
        passingMarks: 40,
        allowedAttempts: 0,
        negativeMarks: 0,
        targetYear: 'All',
        scheduledDate: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/quizzes', formData);
            showSuccessAlert('Success!', 'Quiz created successfully.');
            navigate(`/admin/manage-quiz/${data._id}`);
        } catch (error) {
            showErrorAlert('Error', 'Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-900">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-violet-400/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative z-10 p-6 md:p-10 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <div className="flex justify-start items-center mb-6 relative">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold group px-4 py-2 rounded-full hover:bg-white/80"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back</span>
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-900 mb-3 drop-shadow-sm">
                        Create New Quiz
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center justify-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        Fill in the details below to create a new quiz.
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Quiz Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/50 p-6 md:p-8 relative overflow-hidden group hover:shadow-indigo-500/10 transition-all duration-500"
                    >
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <span className="text-2xl font-bold">Q</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Quiz Details</h2>
                                <p className="text-slate-500 font-medium text-sm">Basic information about this quiz.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50/50 border-2 border-slate-100 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-lg text-slate-800 placeholder-slate-400 transition-all"
                                    placeholder="e.g. JavaScript Fundamentals"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50/50 border-2 border-slate-100 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all resize-none"
                                    placeholder="What is this quiz about?"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                                <div className="relative">
                                    <Grid className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 rounded-xl bg-slate-50/50 border-2 border-slate-100 hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 placeholder-slate-400 transition-all"
                                        placeholder="e.g. Programming"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Target Audience (Year)</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {['All', 'FY', 'SY', 'TY'].map((year) => (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, targetYear: year })}
                                            className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${formData.targetYear === year
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 active:scale-95'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 2: Configuration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/50 p-6 md:p-8 group hover:shadow-emerald-500/10 transition-all duration-500"
                    >
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Zap size={24} strokeWidth={2.5} fill="currentColor" className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Quiz Settings</h2>
                                <p className="text-slate-500 font-medium text-sm">Configure time and marking rules.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Duration (Min)</label>
                                <div className="relative">
                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-800 transition-all big-number-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Scheduled Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduledDate || ''}
                                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50/50 border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-slate-800 transition-all uppercase text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Marks</label>
                                <div className="relative">
                                    <Award className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-slate-800 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Passing Marks</label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        value={formData.passingMarks}
                                        onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50/50 border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Negative Marks</label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={formData.negativeMarks}
                                        onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50/50 border-2 border-slate-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-slate-800 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div
                                onClick={() => setFormData({ ...formData, allowedAttempts: formData.allowedAttempts === 1 ? 0 : 1 })}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${formData.allowedAttempts === 1
                                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className={formData.allowedAttempts === 1 ? 'text-white' : 'text-slate-700'}>
                                    <h4 className="font-bold text-base">One Attempt Only</h4>
                                    <p className={`text-xs ${formData.allowedAttempts === 1 ? 'text-indigo-200' : 'text-slate-500'}`}>Enable strict mode</p>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.allowedAttempts === 1 ? 'bg-white/20' : 'bg-slate-300'}`}>
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.allowedAttempts === 1 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-slate-900 to-indigo-900 text-white font-black text-xl shadow-2xl shadow-indigo-900/30 hover:shadow-indigo-900/50 transition-all relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        {loading ? 'Creating...' : (
                            <span className="flex items-center justify-center gap-2">
                                <Save size={20} /> Create Quiz Now
                            </span>
                        )}
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default CreateQuiz;
