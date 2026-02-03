import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Trophy,
    Activity,
    Zap,
    Target,
    Star,
    ArrowRight
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/results/myresults').catch(() => ({ data: [] }));
                const quizzesTaken = data?.length || 0;
                const totalScore = data?.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) || 0;
                const averageScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

                setStats({
                    quizzesTaken,
                    averageScore,
                    recentActivity: data?.slice(0, 3) || []
                });
            } catch (error) {
                console.error("Dashboard data error", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
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
                        ) : stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${(activity.score / activity.totalQuestions) * 100 >= 50
                                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                            : 'bg-gradient-to-br from-orange-400 to-red-500'
                                            }`}>
                                            {(activity.score / activity.totalQuestions) * 100 >= 50 ? <Star size={20} /> : <Activity size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{activity.quiz?.title || 'Quiz'}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-lg text-slate-800">
                                            {activity.score}/{activity.totalQuestions}
                                        </span>
                                        <span className={`text-xs font-bold uppercase ${(activity.score / activity.totalQuestions) * 100 >= 50 ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                            {(activity.score / activity.totalQuestions) * 100 >= 50 ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <BookOpen size={24} className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-medium">No activity yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
