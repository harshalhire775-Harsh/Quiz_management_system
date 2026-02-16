import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { title: 'Total Colleges', value: '0', icon: ShieldCheck, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sysStats } = await API.get('/users/stats');

                setStats([
                    { title: 'Total Colleges', value: sysStats.totalDepartments || sysStats.totalAdmins || 0, icon: ShieldCheck, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
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
            <div className="mb-8">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-3">
                    <ShieldCheck size={12} /> Master Control
                </span>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                    Super Admin <span className="text-blue-600">Dashboard</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium text-lg">
                    Welcome back, {user?.name}
                </p>
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
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="text-amber-500" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => navigate('/super-admin/departments')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                <Building2 size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700 text-lg">Manage College</span>
                                <span className="text-sm text-slate-400">Add or remove colleges</span>
                            </div>
                        </div>
                        <ArrowUpRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
                    </button>

                    <button onClick={() => navigate('/admin/admin-requests')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-slate-700 text-lg">Admin Requests</span>
                                <span className="text-sm text-slate-400">Review new admins</span>
                            </div>
                        </div>
                        <ArrowUpRight className="text-slate-300 group-hover:text-amber-500 transition-colors" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
