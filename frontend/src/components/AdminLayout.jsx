import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, LogOut, PlusCircle, ShieldCheck, Briefcase, Home, BookOpen, Building2, ClipboardList, MessageSquare } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import logo from '../assets/logo.png';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const [expanded, setExpanded] = useState({});

    const toggleExpand = (label) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // Determine Dashboard Path
    const getDashboardPath = () => {
        if (user?.role === 'Super Admin') return '/super-admin';
        if (user?.role === 'Sir') {
            return user?.isHead ? '/department-dashboard' : '/teacher-dashboard';
        }
        return '/admin';
    };

    const navItems = [
        { path: getDashboardPath(), icon: LayoutDashboard, label: "Dashboard", roles: ['Admin (HOD)', 'Super Admin', 'Sir'] },
        { path: "/admin/create-quiz", icon: PlusCircle, label: "Create Quiz", roles: [user?.isHead ? 'non-head-sir-only' : 'Sir'] },
        { path: "/admin/quizzes", icon: ClipboardList, label: "Attendance Info", roles: [user?.isHead ? 'non-head-sir-only' : 'Sir'] },

        { path: "/super-admin/departments", icon: Building2, label: "Manage College", roles: ['Super Admin'] },
        { path: "/admin/departments", icon: Building2, label: "Departments", roles: ['Admin (HOD)'] },

        {
            path: "/admin/manage-sirs",
            label: "Manage Teachers",
            icon: UserCog,
            roles: user?.role === 'Sir' ? (user?.isHead ? ['Sir'] : []) : ['Admin (HOD)']
        },
        {
            path: "/admin/assign-subject",
            label: "Assign Subject",
            icon: Briefcase,
            roles: user?.role === 'Sir' ? (user?.isHead ? ['Sir'] : []) : ['Admin (HOD)']
        },
        {
            path: "/admin/users",
            label: "Manage Students",
            icon: Users,
            roles: ['Sir', 'Admin (HOD)'],
            children: [
                { path: "/admin/users", label: "All Students", icon: Users, roles: ['Sir', 'Admin (HOD)'] },
                { path: "/admin/users?year=FY", label: "FY Students", icon: Users, roles: ['Sir', 'Admin (HOD)'] },
                { path: "/admin/users?year=SY", label: "SY Students", icon: Users, roles: ['Sir', 'Admin (HOD)'] },
                { path: "/admin/users?year=TY", label: "TY Students", icon: Users, roles: ['Sir', 'Admin (HOD)'] },
            ]
        },

        { path: "/admin/manage-hods", icon: ShieldCheck, label: "Manage HODs", roles: ['Admin (HOD)'] },
        { path: "/admin/manage-hods", icon: ShieldCheck, label: "Manage HODs", roles: ['Admin (HOD)'] },
        { path: "/admin/queries", icon: Users, label: "Complaint Section", roles: ['Super Admin'] },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col shadow-xl">
                <div className="p-8 border-b border-slate-100">
                    <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-800">
                        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center overflow-hidden w-12 h-12">
                            <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                            QuizPro
                        </span>
                    </h2>
                    <p className="ml-14 -mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider truncate max-w-[180px]">
                        {user?.role === 'Super Admin' ? 'Super Admin' :
                            user?.role === 'Admin (HOD)' ? 'College Admin' :
                                (user?.role === 'Sir' && user?.isHead) ? 'Department Admin' : 'Teacher'}
                    </p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navItems.map((item) => {
                        if (item.roles && !item.roles.includes(user?.role)) return null;

                        const active = isActive(item.path);
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expanded[item.label];

                        return (
                            <div key={item.path}>
                                <div
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group cursor-pointer
                                        ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                                    onClick={() => {
                                        if (hasChildren) toggleExpand(item.label);
                                        navigate(item.path);
                                    }}
                                >
                                    <item.icon size={22} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="font-bold flex-1">{item.label}</span>
                                    {hasChildren && (
                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    )}
                                </div>

                                {/* Render Children */}
                                {hasChildren && isExpanded && (
                                    <div className="ml-4 pl-4 border-l-2 border-slate-100 mt-1 space-y-1">
                                        {item.children.map(child => {
                                            if (child.roles && !child.roles.includes(user?.role)) return null;
                                            const childActive = isActive(child.path);
                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold
                                                        ${childActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
                                                >
                                                    <child.icon size={18} />
                                                    <span>{child.label}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="my-6 border-t border-slate-100 mx-2"></div>


                </nav>

                <div className="p-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4 border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-slate-800 truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.role === 'Admin (HOD)' ? 'College Admin' :
                                    user?.role === 'Super Admin' ? 'Super Admin' :
                                        (user?.role === 'Sir' && user?.isHead) ? 'Department Admin' : 'Teacher'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 py-3.5 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 min-h-screen bg-slate-50">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-40 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 p-1.5 bg-white rounded-xl border border-slate-100 shadow-md">
                            <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-black text-slate-800">QuizPro</span>
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
