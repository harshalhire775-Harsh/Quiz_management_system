import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Users,
    BookOpen,
    Trash2,
    Edit,
    GraduationCap,
    Briefcase,
    ArrowUpRight,
    ShieldCheck,
    Building2,
    UserPlus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';

const DepartmentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState([
        { title: 'Total Teachers', value: '0', icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
        { title: 'Total Students', value: '0', icon: GraduationCap, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        { title: 'Total Subjects', value: '0', icon: BookOpen, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },

    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine Department Name or Subject Name
                const subjectName = user?.subject?.[0] || 'General';

                // Fetch real department stats
                const { data } = await API.get('/users/dashboard-stats');

                setStats([
                    { title: 'Total Teachers', value: data.totalTeachers || 0, icon: Briefcase, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
                    { title: 'Total Students', value: data.totalStudents || 0, icon: GraduationCap, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                    { title: 'Total Subjects', value: data.totalSubjects || 0, icon: BookOpen, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },

                ]);

            } catch (error) {
                console.error('Failed to fetch department data', error);
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
                        <Building2 size={12} /> Department Dashboard
                    </span>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        {user?.subject?.[0] || 'Department'}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Welcome back, {user?.name}.
                    </p>
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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

            {/* Management Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Teacher Management */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase size={18} className="text-violet-500" /> Teacher Management
                        </h2>
                        <button
                            onClick={() => navigate('/admin/manage-sirs')}
                            className="text-xs font-bold text-white bg-violet-600 px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            Manage All
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-500 mb-4">View teacher list and assign subjects.</p>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">Assign Subjects</p>
                                    <p className="text-xs text-slate-400">Map subjects to faculty</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/assign-subject')}
                                className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                            >
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subject Management */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen size={18} className="text-emerald-500" /> Subject Management
                        </h2>
                        <button className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                            Manage All
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-500 mb-4">Add and manage department subjects.</p>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                    <Plus size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">Add New Subject</p>
                                    <p className="text-xs text-slate-400">Expand curriculum</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/assign-subject')}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default DepartmentDashboard;
