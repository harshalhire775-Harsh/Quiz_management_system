import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Users,
    BookOpen,
    Trash2,
    Edit,
    Activity,
    GraduationCap,
    Briefcase,
    ArrowUpRight,
    ShieldCheck,
    Building2,
    UserPlus,
    FileSpreadsheet,
    Settings,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';

const HODDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState([
        { title: 'Total Users', value: '0', icon: Users, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        { title: 'Pending Quizzes', value: '0', icon: ShieldCheck, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
        { title: 'Colleges', value: '0', icon: ShieldCheck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
        { title: 'Teachers', value: '0', icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch system stats which includes totalDepartments, totalSirs, totalStudents etc.
                const { data: sysStats } = await API.get('/users/stats');

                setStats([
                    { title: 'Total HODs', value: sysStats.totalHODs || 0, icon: ShieldCheck, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
                    { title: 'Total Departments', value: sysStats.totalDepartments || 0, icon: Building2, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                    { title: 'Total Teachers', value: sysStats.totalSirs || 0, icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
                    { title: 'Total Students', value: sysStats.totalStudents || 0, icon: GraduationCap, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                ]);

            } catch (error) {
                console.error('Failed to fetch hod data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

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
            <div className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-50 to-purple-50 rounded-full blur-3xl -ml-16 -mb-16 opacity-60 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100">
                            <Building2 size={12} /> COLLEGE DASHBOARD
                        </span>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800">
                                {user?.department || 'College'}
                            </span>
                        </h1>
                    </div>

                    <div className="flex gap-3">

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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:col-span-3"
                >
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity className="text-amber-500" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button onClick={() => navigate('/admin/manage-hods')} className="p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
                            <div className="p-3 rounded-xl bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700">Manage HODs</span>
                                <span className="text-xs text-slate-500">Department Heads</span>
                            </div>
                            <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-violet-500" size={18} />
                        </button>
                        <button onClick={() => navigate('/admin/manage-sirs')} className="p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
                            <div className="p-3 rounded-xl bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700">Manage Teachers</span>
                                <span className="text-xs text-slate-500">Add or edit faculty</span>
                            </div>
                            <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-violet-500" size={18} />
                        </button>



                        <button onClick={() => navigate('/admin/users')} className="p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                <GraduationCap size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700">Manage Students</span>
                                <span className="text-xs text-slate-500">View student list</span>
                            </div>
                            <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-emerald-500" size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HODDashboard;
