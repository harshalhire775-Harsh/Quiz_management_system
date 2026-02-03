import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    BookOpen,
    Activity,
    Users,
    ClipboardList,
    Trophy,
    GraduationCap,
    Trash2,
    Edit,
    Power,
    Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [stats, setStats] = useState([
        { title: 'My Quizzes', value: '0', icon: ClipboardList, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        { title: 'My Students', value: '0', icon: Users, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    ]);
    const [studentStats, setStudentStats] = useState({ fy: 0, sy: 0, ty: 0 });

    useEffect(() => {
        const fetchTeacherStats = async () => {
            try {
                // Fetch quizzes created by this teacher
                const { data: quizzes } = await API.get('/quizzes/my-quizzes');
                setRecentQuizzes(quizzes.slice(0, 5)); // Keep top 5 latest
                // Fetch student year stats
                const { data: years } = await API.get('/users/student-years');
                setStudentStats(years);

                // Calculate stats
                const totalQuizzes = quizzes.length;

                // We might want to fetch unique students who attempted these quizzes later.
                // For now, let's keep it simple or fetch if endpoint exists.
                // Assuming we can get student count from somewhere or mock it for now until 'Results' endpoint is refined for teacher stats.

                setStats([
                    { title: 'My Quizzes', value: totalQuizzes, icon: ClipboardList, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                    { title: 'Subjects', value: user?.subject?.length || 0, icon: BookOpen, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
                ]);

            } catch (error) {
                console.error('Failed to fetch teacher stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacherStats();
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await API.delete(`/quizzes/${id}`);
                setRecentQuizzes(recentQuizzes.filter(q => q._id !== id));
                // Update stats locally as well
                setStats(prev => prev.map(s => s.title === 'My Quizzes' ? { ...s, value: s.value - 1 } : s));
            } catch (error) {
                alert('Failed to delete quiz');
            }
        }
    };

    const handleToggleStatus = async (quiz) => {
        try {
            const updatedStatus = !quiz.isPublished;
            // Optimistic update
            const updatedQuiz = { ...quiz, isPublished: updatedStatus };
            setRecentQuizzes(prev => prev.map(q => q._id === quiz._id ? updatedQuiz : q));

            await API.put(`/quizzes/${quiz._id}`, updatedQuiz);
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
            // Revert on failure
            setRecentQuizzes(prev => prev.map(q => q._id === quiz._id ? quiz : q));
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider mb-2 border border-violet-100">
                        <GraduationCap size={12} /> Teacher Dashboard
                    </span>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Welcome, {user?.name}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
                        <BookOpen size={16} className="text-violet-500" />
                        <span className="text-slate-600">Subject: </span>
                        <span className="font-bold text-slate-800">{user?.subject?.length > 0 ? user.subject.join(', ') : 'Not Assigned'}</span>
                    </p>

                </div>

            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        variants={item}
                        key={index}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-default"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wide">{stat.title}</h3>
                                <span className="text-3xl font-black text-slate-800">{stat.value}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Student Distribution Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'FY Students', value: studentStats.fy, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20', label: 'First Year' },
                    { title: 'SY Students', value: studentStats.sy, color: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-500/20', label: 'Second Year' },
                    { title: 'TY Students', value: studentStats.ty, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20', label: 'Third Year' }
                ].map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        key={index}
                        className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all"
                    >
                        <div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800 group-hover:scale-110 transition-transform origin-left">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-lg ${stat.shadow}`}>
                            <Users size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>



            {/* Stats Grid for Student Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manage Quizzes */}
                <div
                    onClick={() => navigate('/admin/quizzes')}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">My Quizzes</h3>
                            <p className="text-sm text-slate-500">View and manage created quizzes</p>
                        </div>
                    </div>
                </div>

                {/* Manage Students */}
                <div
                    onClick={() => navigate('/admin/users')}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">My Students</h3>
                            <p className="text-sm text-slate-500">View student details</p>
                        </div>
                    </div>
                </div>

                {/* Contact Student */}
                <div
                    onClick={() => navigate('/teacher/contact-student')}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">Contact Student</h3>
                            <p className="text-sm text-slate-500">Message students directly</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TeacherDashboard;
