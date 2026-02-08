import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { motion } from "framer-motion";

const Header = () => {
    const [isDark, setIsDark] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // FORCE LIGHT MODE (User Request)
        setIsDark(false);
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, []);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Contact Us", path: "/#contact" }
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="container mx-auto px-8 py-3.5 flex justify-between items-center text-sm">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-2.5">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 w-10 h-10 flex items-center justify-center overflow-hidden"
                    >
                        <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                    </motion.div>
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        QuizPro
                        <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-0.5">Platform</span>
                    </span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map((item) => {
                        const isHashLink = item.path.includes('#');
                        const isActive = location.pathname === item.path;
                        return isHashLink ? (
                            <a
                                key={item.name}
                                href={item.path}
                                className="text-slate-600 font-semibold hover:text-blue-600 transition-colors relative py-1 group"
                            >
                                {item.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600/80 rounded-full transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ) : (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`font-semibold transition-colors relative py-1 group ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                                    }`}
                            >
                                {item.name}
                                <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600/80 rounded-full transition-all duration-300 group-hover:w-full ${isActive ? 'w-full' : 'w-0'}`}></span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {/* Register Button */}
                    <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                        <Link
                            to="/register"
                            className="text-slate-700 hover:text-blue-600 px-4 py-2 font-bold transition-all text-sm"
                        >
                            Register
                        </Link>
                    </motion.div>

                    {/* Login Button */}
                    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98, y: 0 }}>
                        <Link
                            to="/login"
                            className="bg-blue-600 text-white px-7 py-2.5 rounded-xl font-extrabold shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-[0_15px_25px_-5px_rgba(37,99,235,0.4)] transition-all text-sm block"
                        >
                            Login Now
                        </Link>
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default Header;