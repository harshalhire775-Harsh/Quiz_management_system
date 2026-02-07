import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-fuchsia-900/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-900/50">Q</div>
                            <span className="text-2xl font-black text-white tracking-tight">QuizPro</span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Empowering learners worldwide with interactive quizzes and smart analytics. Join the future of education today.
                        </p>
                        <div className="flex gap-4">
                            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
                                <a key={index} href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-indigo-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 text-white">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {['Home', 'About Us', 'Contact', 'Login', 'Register'].map((item) => (
                                <li key={item}>
                                    <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 group-hover:bg-indigo-400 transition-colors"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Resources</h4>
                        <ul className="space-y-4">
                            {['Blog', 'Help Center', 'Terms of Service', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 group-hover:bg-indigo-400 transition-colors"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-white/10 p-2 rounded-lg text-indigo-400">
                                    <FaMapMarkerAlt />
                                </div>
                                <span>342, Jay Gaytri Nagar, Navagam, Surat, Gujarat - 394210</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-2 rounded-lg text-indigo-400">
                                    <FaEnvelope />
                                </div>
                                <span>contact@quizpro.com</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-2 rounded-lg text-indigo-400">
                                    <FaPhone />
                                </div>
                                <span>+91 9106737867</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
                    <p>&copy; {new Date().getFullYear()} QuizPro Inc. All rights reserved.</p>
                    <div className="flex items-center gap-1.5">
                        Made with <FaHeart className="text-rose-500 animate-pulse" /> by <span className="text-white">Harshal Hire</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
