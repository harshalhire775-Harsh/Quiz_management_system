import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Users,
    BookOpen,
    Trash2,
    Edit,
    BarChart as BarChartIcon,
    Activity,
    GraduationCap,
    Briefcase,
    ArrowUpRight,
    ShieldCheck,
    CheckCircle,
    LayoutDashboard,
    TrendingUp,
    LogOut,
    School,
    UserPlus,
    UserCheck,
    FileSpreadsheet,
    Building2
} from 'lucide-react';

import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import DepartmentDashboard from './DepartmentDashboard';
import HODDashboard from './HODDashboard';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'Sir') {
            if (user?.isHead) {
                navigate('/department-dashboard');
            } else {
                navigate('/teacher-dashboard');
            }
        }
    }, [user, navigate]);

    // Render HOD Dashboard directly for HODs
    if (user?.role === 'Admin (HOD)') {
        return <HODDashboard />;
    }


    const [quizzes, setQuizzes] = useState([]);
    const [results, setResults] = useState([]);
    const [messages, setMessages] = useState([]); // New state for messages
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState([
        { title: 'Total Quizzes', value: '0', icon: BookOpen, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        { title: 'Total Students', value: '0', icon: GraduationCap, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
        { title: 'Active Teachers', value: '0', icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
        { title: 'Pass Rate', value: '0%', icon: Activity, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
    ]);

    const isSuperAdmin = user?.role === 'Super Admin';
    const isDeptHead = user?.role === 'Admin (HOD)' || isSuperAdmin;

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isDeptHead) {
                    // Super Admin & Admin (HOD) Logic
                    // User System Stats (Requires new /api/users/stats permission for HOD)
                    const { data: sysStats } = await API.get('/users/stats');

                    // Fetch pending quizzes count specifically
                    const { data: pendingQuizzes } = await API.get('/quizzes/pending');

                    if (isSuperAdmin) {
                        const { data: msgs } = await API.get('/contact');
                        setMessages(msgs);
                        setStats([
                            { title: 'Total Colleges', value: sysStats.totalAdmins, icon: ShieldCheck, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                        ]);
                    } else {
                        // Admin (HOD) Logic
                        setStats([
                            { title: 'Total Users', value: '0', icon: Users, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                            { title: 'Pending Quizzes', value: pendingQuizzes.length, icon: ShieldCheck, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
                            { title: 'Colleges', value: sysStats.totalAdmins, icon: ShieldCheck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                            { title: 'Teachers', value: sysStats.totalSirs, icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
                        ]);
                    }

                    // Retrieve global quizzes for the chart if desired
                    const { data: allQuizzes } = await API.get('/quizzes');
                    setQuizzes(allQuizzes);



                } else {
                    // Regular Teacher/Instructor Logic
                    const [quizzesRes, resultsRes] = await Promise.all([
                        API.get('/quizzes/my-quizzes'), // Fetch own quizzes
                        API.get('/results')
                    ]);
                    setQuizzes(quizzesRes.data);
                    setResults(resultsRes.data);

                    const totalStudents = new Set(resultsRes.data.map(r => r.user?._id)).size;
                    // stats Logic for Teacher
                    const pendingCount = quizzesRes.data.filter(q => !q.isApproved).length;
                    const liveCount = quizzesRes.data.filter(q => q.isApproved && q.isPublished).length;

                    const passRate = resultsRes.data.length > 0
                        ? Math.round((resultsRes.data.filter(r => (r.score / r.totalQuestions) > 0.4).length / resultsRes.data.length) * 100)
                        : 0;

                    setStats([
                        { title: 'Pending Approval', value: pendingCount, icon: ShieldCheck, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
                        { title: 'Live Quizzes', value: liveCount, icon: Activity, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                        { title: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                        { title: 'Avg. Pass Rate', value: `${passRate}%`, icon: BarChartIcon, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
                    ]);
                }

            } catch (error) {
                console.error('Failed to fetch admin data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, isSuperAdmin]);

    const handleDeleteQuiz = async (id) => {
        if (isSuperAdmin) {
            showErrorAlert("Denied", "Super Admins are not allowed to delete quizzes.");
            return;
        }
        const isConfirmed = await showConfirmAlert(
            'Delete Quiz?',
            'Are you sure you want to delete this quiz? All associated questions will be removed.'
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

    const handleDeleteMessage = async (id) => {
        const isConfirmed = await showConfirmAlert('Delete Message?', 'Are you sure you want to delete this message?');
        if (isConfirmed) {
            try {
                await API.delete(`/contact/${id}`);
                setMessages(prev => prev.filter(m => m._id !== id));
                showSuccessAlert('Deleted!', 'Message removed successfully');
            } catch (error) {
                showErrorAlert('Failed!', 'Failed to delete message');
            }
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
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );



    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            {/* Premium Header Banner */}
            <div className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-50 to-purple-50 rounded-full blur-3xl -ml-16 -mb-16 opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        {isSuperAdmin && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-md shadow-slate-900/10">
                                <ShieldCheck size={12} /> Master Control
                            </span>
                        )}
                        {!isSuperAdmin && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100">
                                <Building2 size={12} /> {isDeptHead ? 'College Portal' : (user?.subject?.length > 0 ? 'Department Dashboard' : 'Faculty Dashboard')}
                            </span>
                        )}

                        <h1 className="text-3xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                            {isSuperAdmin ? (
                                <span>Super Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</span></span>
                            ) : (
                                <span className={user?.department ? "text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800" : "text-slate-800"}>
                                    {(!isDeptHead && user?.subject?.length > 0) ? user.subject[0] : (user?.department || (user?.name ? `${user.name}'s Dashboard` : 'Dashboard'))}
                                </span>
                            )}
                        </h1>

                        {!isSuperAdmin && isDeptHead && user?.department && (
                            <p className="text-slate-500 mt-2 font-medium text-lg flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                Administrator Panel
                            </p>
                        )}
                        {!isSuperAdmin && !isDeptHead && (
                            <p className="text-slate-500 mt-2 font-medium text-lg">
                                Welcome back, {user?.name}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0">

                        {isDeptHead && !isSuperAdmin && (
                            <button
                                onClick={() => navigate('/admin/manage-sirs')}
                                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                            >
                                <Briefcase size={20} />
                                <span>Manage Teachers</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        variants={item}
                        key={index}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group cursor-default"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={26} />
                            </div>
                        </div>
                        <h3 className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wide">{stat.title}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-800">{stat.value}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                {/* Quick Actions & Widgets */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:col-span-3"
                >
                    {/* Assigned Subjects Widget for Teachers */}
                    {!isDeptHead && (
                        <div className="mb-8 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl">
                            <h3 className="text-sm font-bold text-violet-800 uppercase mb-3 flex items-center gap-2">
                                <Briefcase size={16} /> Assigned Subjects
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {user?.subject && user.subject.length > 0 ? (
                                    user.subject.map((sub, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-bold border border-violet-200 shadow-sm">
                                            {sub}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-500 font-medium italic">No subjects assigned yet.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity className="text-amber-500" />
                        Quick Actions
                    </h2>
                    <div className="space-y-4 flex-1">


                        {isSuperAdmin && (
                            <button onClick={() => navigate('/super-admin/departments')} className="w-full p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-slate-700">Manage College</span>
                                    <span className="text-xs text-slate-500">Control role access</span>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-emerald-500" size={18} />
                            </button>
                        )}

                        {isSuperAdmin && (
                            <button onClick={() => navigate('/admin/admin-requests')} className="w-full p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                                <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-slate-700">Admin Requests</span>
                                    <span className="text-xs text-slate-500">Review new admins</span>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-amber-500" size={18} />
                            </button>
                        )}





                        {isDeptHead && !isSuperAdmin && (
                            <button onClick={() => navigate('/admin/manage-sirs')} className="w-full p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
                                <div className="p-3 rounded-xl bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
                                    <Users size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-slate-700">Manage Teachers</span>
                                    <span className="text-xs text-slate-500">{isSuperAdmin ? 'View All Staff' : 'Manage Department Teachers'}</span>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-violet-500" size={18} />
                            </button>
                        )}


                        {isDeptHead && !isSuperAdmin && (
                            <button onClick={() => navigate('/admin/users')} className="w-full p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all group">
                                <div className="p-3 rounded-xl bg-sky-100 text-sky-600 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-slate-700">Manage Students</span>
                                    <span className="text-xs text-slate-500">View enrolled students</span>
                                </div>
                                <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-sky-500" size={18} />
                            </button>
                        )}


                    </div>

                    {/* Weak Students Widget for Teachers */}
                    {!isDeptHead && (
                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Needs Attention (Low Score &lt; 40%)</h3>
                            <div className="space-y-3">
                                {results.filter(r => (r.score / r.totalQuestions) < 0.4).length > 0 ? (
                                    results.filter(r => (r.score / r.totalQuestions) < 0.4).slice(0, 5).map((result, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs">
                                                    {result.user?.name?.charAt(0) || '!'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{result.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-red-500 font-medium">{result.quizTitle}</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-red-600 border border-red-100">
                                                {result.score}/{result.totalQuestions}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center bg-emerald-50 rounded-xl border border-emerald-100">
                                        <p className="text-sm font-bold text-emerald-700">All students performing well! 🎉</p>
                                        {/* Contact Messages (Super Admin Only) */}


                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div >

            {/* User Queries Table (Compact Dashboard View) */}


            {/* Quizzes Table (Hide for Super Admin) */}

        </div >
    );
};

export default AdminDashboard;
