import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Trophy,
    Activity,
    Zap,
    Target,
    Star,
    ArrowRight,
    Bell,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import API from '../api/axios';

const StudentDashboard = () => {
    const { user } = useAuth(); // Layout handles logout now
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        quizzesTaken: 0,
        averageScore: 0,
        recentActivity: []
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await API.get('/quizzes/student-dashboard'); // Existing
                setStats({
                    quizzesTaken: data.quizzesTaken,
                    averageScore: data.averageScore,
                    completionRate: data.completionRate
                });
                setRecentActivities(data.recentActivity || []);

                // Fetch Unread Messages Count
                const msgRes = await API.get('/contact');
                const unread = msgRes.data.filter(m => !m.isRead).length;
                setUnreadCount(unread);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
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

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Banner */}
            <motion.div
                variants={item}
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                            Student Dashboard
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                            Welcome, {user?.name?.split(' ')[0]}!
                        </h1>

                    </div>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
                    >
                        Start New Quiz
                    </button>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <BookOpen size={24} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Total Quizzes</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{stats.quizzesTaken}</p>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Target size={24} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Average Score</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{stats.averageScore}%</p>
                </motion.div>

                <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Trophy size={24} />
                        </div>
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Points Earned</h3>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{stats.quizzesTaken * 100}</p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications */}
                <motion.div
                    variants={item}
                    onClick={() => navigate('/notifications')}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer group flex items-center gap-4 relative overflow-visible"
                >
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center relative">
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-amber-600 transition-colors">Notifications</h3>
                        <p className="text-sm text-slate-500">View latest updates & replies</p>
                    </div>
                </motion.div>

                {/* Contact Teacher */}
                <motion.div
                    variants={item}
                    onClick={() => navigate('/contact-teacher')}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer group flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">Contact Teacher</h3>
                        <p className="text-sm text-slate-500">Ask questions or report issues</p>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 gap-8">
                <motion.div variants={item} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Activity className="text-indigo-500" size={20} />
                            Recent Activity
                        </h2>
                        <Link to="/myresults" className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{activity.quizTitle}</h3>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-black text-slate-800">{activity.score} pts</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400 font-medium">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
