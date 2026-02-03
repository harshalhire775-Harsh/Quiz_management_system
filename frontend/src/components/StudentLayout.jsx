import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    BookOpen,
    MessageSquare,
    User,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Zap
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarLinks = [
        { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
        { name: 'My Quizzes', path: '/quizzes', icon: BookOpen },
        { name: 'Contact Teacher', path: '/contact-teacher', icon: MessageSquare },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30 selection:text-indigo-900">

            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 fixed h-full z-30 hidden md:flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-100 w-10 h-10 overflow-hidden">
                            <img src={logo} alt="QP" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-black text-xl text-slate-800 tracking-tight">QuizPro</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <link.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                        <h4 className="font-bold text-slate-800 text-sm mb-1">Daily Streak</h4>
                        <div className="flex items-center gap-2">
                            <Zap size={20} className="text-amber-500 fill-amber-500" />
                            <span className="text-2xl font-black text-slate-800">{user?.streak?.current || 0}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Days</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors w-full"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>

                    <div className="mt-4 flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-100 z-40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded-lg border border-slate-100 w-8 h-8 flex items-center justify-center">
                        <img src={logo} alt="QP" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-black text-lg text-slate-800">QuizPro</span>
                </div>
                <button onClick={toggleMenu} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 z-30 bg-white md:hidden overflow-y-auto"
                    >
                        <div className="p-4 space-y-2">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-lg ${location.pathname === link.path
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600'
                                        }`}
                                >
                                    <link.icon size={24} />
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-lg text-red-500 w-full mt-4"
                            >
                                <LogOut size={24} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 md:p-8 pt-24 md:pt-8 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
