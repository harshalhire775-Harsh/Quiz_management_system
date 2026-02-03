import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

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
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-colors duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-2">
                    <div className="bg-white p-1 rounded-xl group-hover:scale-110 transition-transform shadow-lg border border-slate-100 w-10 h-10 overflow-hidden">
                        <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">
                        QuizPro
                    </span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center gap-8 font-medium text-slate-900">
                    {navLinks.map((item) => {
                        const isHashLink = item.path.includes('#');
                        return isHashLink ? (
                            <a
                                key={item.name}
                                href={item.path}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {item.name}
                            </a>
                        ) : (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`hover:text-blue-600 transition-colors ${location.pathname === item.path ? 'text-blue-600 font-bold' : ''
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    {/* Login Button */}
                    <Link
                        to="/login"
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-md font-semibold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all transform text-center min-w-[100px]"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;