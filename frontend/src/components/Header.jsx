import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { motion } from "framer-motion";

const Header = () => {
    const [isDark, setIsDark] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // LIGHT MODE (User Request Revert)
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, []);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/#contact" }
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-3xl border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-8 py-3.5 flex justify-between items-center text-sm">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-2.5">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 flex items-center justify-center overflow-hidden bg-white rounded-full shadow-lg border border-slate-100 p-1"
                    >
                        <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                    </motion.div>
                    <span className="text-2xl font-black tracking-tight leading-none text-slate-900">
                        QuizPro
                    </span>
                </Link>

                {/* Right Side Actions & Navigation */}
                <div className="flex items-center gap-28">
                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((item) => {
                            const isHashLink = item.path.includes('#');
                            const isActive = location.pathname === item.path;
                            return isHashLink ? (
                                <a
                                    key={item.name}
                                    href={item.path}
                                    className="text-slate-600 font-semibold hover:text-blue-600 transition-colors relative py-1 group text-sm"
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            ) : (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`font-semibold transition-colors relative py-1 group text-sm ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                                        }`}
                                >
                                    {item.name}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full ${isActive ? 'w-full' : 'w-0'}`}></span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Register Button */}
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98, y: 0 }}>
                            <Link
                                to="/register"
                                className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-extrabold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm block text-center min-w-[120px]"
                            >
                                Register
                            </Link>
                        </motion.div>

                        {/* Login Button */}
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98, y: 0 }}>
                            <Link
                                to="/login"
                                className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-extrabold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm block text-center min-w-[120px]"
                            >
                                Login
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;