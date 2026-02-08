import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, BookOpen, GraduationCap, Briefcase, Building2, BarChart as BarChartIcon, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);

    const [stats, setStats] = useState([
        { title: 'Total Colleges', value: '0', icon: ShieldCheck, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        { title: 'Total Teachers', value: '0', icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
        { title: 'Total Students', value: '0', icon: GraduationCap, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
        { title: 'Departments', value: '0', icon: Building2, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sysStats } = await API.get('/users/stats');
                const { data: msgs } = await API.get('/contact');
                setMessages(msgs);

                setStats([
                    { title: 'Total Colleges', value: sysStats.totalAdmins || 0, icon: ShieldCheck, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                ]);
            } catch (error) {
                console.error('Failed to fetch super admin data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-3 shadow-md shadow-slate-900/10">
                            <ShieldCheck size={12} /> Master Control
                        </span>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                            Super Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium text-lg">
                            Welcome back, {user?.name}
                        </p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => navigate('/super-admin/departments')} className="p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                <Building2 size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700">Manage College</span>
                                <span className="text-xs text-slate-500">Add or remove colleges</span>
                            </div>
                            <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-emerald-500" size={18} />
                        </button>





                        <button onClick={() => navigate('/admin/admin-requests')} className="p-4 flex items-center gap-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700">Admin Requests</span>
                                <span className="text-xs text-slate-500">Review new admins</span>
                            </div>
                            <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-amber-500" size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
