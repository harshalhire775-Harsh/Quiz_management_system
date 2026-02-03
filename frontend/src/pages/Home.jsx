import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FaCheckCircle, FaUserShield, FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTwitter, FaPlay, FaUserPlus, FaGithub, FaHeart, FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";

const Home = () => {
    const navigate = useNavigate();
    const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
    const [contactStatus, setContactStatus] = useState('idle'); // idle, sending, success, error

    const handleContactchange = (e) => setContactData({ ...contactData, [e.target.name]: e.target.value });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactStatus('sending');
        try {
            await API.post('/contact', contactData);
            setContactStatus('success');
            setContactData({ name: '', email: '', message: '' });
            alert("Message sent successfully!");
        } catch (error) {
            console.error(error);
            setContactStatus('error');
            alert("Failed to send message.");
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden bg-white text-slate-800 selection:bg-purple-100 selection:text-purple-700">

            {/* Background Pattern - Subtle Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
                <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] translate-x-1/2"></div>
            </div>

            {/* Hero Section */}
            <section id="home" className="relative pt-4 pb-20 lg:pt-4 lg:pb-32 z-10 overflow-hidden bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                        {/* Left Content */}
                        <motion.div
                            className="flex-1 text-center lg:text-left"
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeIn} className="inline-block mb-6 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 font-semibold text-sm tracking-wide shadow-sm">
                                ✨ The #1 Learning Platform
                            </motion.div>

                            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8 text-slate-900">
                                Master <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 animate-gradient-x">
                                    Your Knowledge
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                                Challenge yourself with interactive quizzes, explore millions of resources, and track your progress. <br className="hidden md:block" />All completely <span className="text-green-600 font-bold underline decoration-green-200 decoration-4 underline-offset-2">free for everyone!</span>
                            </motion.p>

                            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/quizzes')}
                                    className="group flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 transition-all"
                                >
                                    <div className="bg-white/20 p-1 rounded-full">
                                        <FaPlay size={14} className="ml-0.5" />
                                    </div>
                                    Start Quiz Now
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/register')}
                                    className="flex items-center justify-center gap-3 bg-white text-slate-700 px-8 py-4 rounded-2xl text-lg font-bold border border-slate-200 shadow-lg shadow-slate-100 hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50 transition-all"
                                >
                                    <FaUserPlus size={18} />
                                    Create Account
                                </motion.button>
                            </motion.div>

                            {/* Stats */}
                            <motion.div variants={fadeIn} className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-center lg:justify-start gap-8 md:gap-16 grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100">
                                {[
                                    { number: "10K+", label: "Active Users" },
                                    { number: "500+", label: "Quizzes" },
                                    { number: "4.9/5", label: "User Rating" }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center lg:text-left">
                                        <h4 className="text-3xl font-black text-slate-800">{stat.number}</h4>
                                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right Content - Image (Restored) */}
                        <motion.div
                            className="flex-1 relative"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="relative z-10 w-full max-w-lg mx-auto">
                                <motion.img
                                    src="/hero-image.png"
                                    alt="Student learning online"
                                    className="w-full h-auto drop-shadow-2xl"
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 6,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>

                            {/* Decorative Elements around image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-purple-500/10 to-orange-500/10 rounded-full blur-3xl -z-10" />
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="app-features" className="py-24 relative z-10 overflow-hidden">



                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight">Why Choose <span className="text-purple-600">QuizPro?</span></h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Discover the powerful features that make QuizPro the preferred choice for thousands of users.</p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: <FaUserShield size={28} />,
                                title: "Secure & Reliable",
                                desc: "Enterprise-grade security ensuring your data and progress remain safe and private.",
                                color: "bg-blue-50 text-blue-600",
                                border: "group-hover:border-blue-200"
                            },
                            {
                                icon: <FaCheckCircle size={28} />,
                                title: "Easy to Use",
                                desc: "Intuitive interface made for everyone. Start creating and taking quizzes in seconds.",
                                color: "bg-green-50 text-green-600",
                                border: "group-hover:border-green-200"
                            },
                            {
                                icon: <FaChartLine size={28} />,
                                title: "Smart Analytics",
                                desc: "Get deep insights into performance with comprehensive charts and real-time tracking.",
                                color: "bg-orange-50 text-orange-600",
                                border: "group-hover:border-orange-200"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                variants={fadeIn}
                                key={i}
                                className={`group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-2 transition-all duration-300 ${feature.border}`}
                            >
                                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-800">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-slate-50 relative z-10 border-y border-slate-100 overflow-hidden">



                <div className="container mx-auto px-6 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-center text-slate-800 mb-20"
                    >
                        How It Works
                    </motion.h2>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-10"
                    >
                        {[
                            { step: 1, title: "Create Account", desc: "Sign up for free and set up your profile in seconds." },
                            { step: 2, title: "Create or Join", desc: "Teachers create quizzes; Students join via code." },
                            { step: 3, title: "Get Results", desc: "Instant grading and performance analysis." }
                        ].map(({ step, title, desc }) => (
                            <motion.div variants={fadeIn} key={step} className="relative bg-white p-10 rounded-3xl shadow-lg border border-slate-100 hover:border-purple-200 transition-colors duration-300">
                                <div className="absolute -top-6 -left-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-purple-200 rotate-3">
                                    {step}
                                </div>
                                <h3 className="text-2xl font-bold mt-6 mb-3 text-slate-800">{title}</h3>
                                <p className="text-slate-500 text-lg leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-white relative overflow-hidden z-10">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-center text-slate-800 mb-20"
                    >
                        Loved by Students & Teachers
                    </motion.h2>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                name: "Alex Johnson",
                                role: "Student",
                                text: "This platform changed how I learn. The instant feedback is amazing!",
                                image: "https://randomuser.me/api/portraits/men/32.jpg"
                            },
                            {
                                name: "Sarah Williams",
                                role: "Teacher",
                                text: "Creating quizzes has never been easier. My students love the interface.",
                                image: "https://randomuser.me/api/portraits/women/44.jpg"
                            },
                            {
                                name: "Michael Chen",
                                role: "Developer",
                                text: "Clean code and great performance. A truly well-designed system.",
                                image: "https://randomuser.me/api/portraits/men/86.jpg"
                            }
                        ].map((t, idx) => (
                            <motion.div
                                variants={fadeIn}
                                key={idx}
                                className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white border border-transparent hover:border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="flex items-center gap-1 mb-6 text-yellow-400">
                                    {"★★★★★"}
                                </div>
                                <p className="mb-8 text-slate-600 text-lg italic font-medium leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="p-1 bg-white rounded-full border border-slate-100 shadow-sm">
                                        <img
                                            src={t.image}
                                            alt={t.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900">{t.name}</h4>
                                        <span className="text-sm text-slate-500 font-semibold uppercase tracking-wide">{t.role}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-white relative z-10">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    >

                        {/* Contact Info (Left) */}
                        <div className="md:w-5/12 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
                                <p className="text-slate-300 mb-10 text-lg">We'd love to hear from you. Fill out the form or reach us via email.</p>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                            <FaEnvelope className="text-white" />
                                        </div>
                                        <span className="text-slate-300 group-hover:text-white transition-colors">harshalhire775@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                            <FaPhone className="text-white" />
                                        </div>
                                        <span className="text-slate-300 group-hover:text-white transition-colors">+91 9106737867</span>
                                    </div>
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                            <FaMapMarkerAlt className="text-white" />
                                        </div>
                                        <span className="text-slate-300 group-hover:text-white transition-colors">342, Jay Gaytri Nagar, Navagam, Surat - 394210</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4 relative z-10">
                                {/* Social Icons */}
                                <a href="https://www.facebook.com/HarshalPatil" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white hover:text-blue-600 text-white rounded-xl transition-all duration-300">
                                    <FaFacebook size={20} />
                                </a>
                                <a href="https://www.Twitter.com/Harshal_1520" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white hover:text-sky-500 text-white rounded-xl transition-all duration-300">
                                    <FaTwitter size={20} />
                                </a>
                                <a href="https://www.instagram.com/harshal_1520" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white hover:text-pink-600 text-white rounded-xl transition-all duration-300">
                                    <FaInstagram size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Contact Form (Right) */}
                        <div className="md:w-7/12 p-12 bg-white">
                            <form onSubmit={handleContactSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={contactData.name}
                                        onChange={handleContactchange}
                                        placeholder="John Doe"
                                        required
                                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={contactData.email}
                                        onChange={handleContactchange}
                                        placeholder="john@example.com"
                                        required
                                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Message</label>
                                    <textarea
                                        rows="4"
                                        name="message"
                                        value={contactData.message}
                                        onChange={handleContactchange}
                                        placeholder="How can we help you?"
                                        required
                                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium resize-none"
                                    ></textarea>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={contactStatus === 'sending'}
                                    className="w-full bg-slate-900 hover:bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all text-lg disabled:opacity-50"
                                >
                                    {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                                </motion.button>
                            </form>
                        </div>

                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white relative">
                <div className="container mx-auto px-6 py-8">
                    {/* Bottom Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <div className="text-center md:text-left">
                            <p>&copy; {new Date().getFullYear()} QuizPro. All rights reserved.</p>
                        </div>

                        <div className="flex items-center gap-1">
                            <span>Made with</span>
                            <FaHeart className="text-red-500" size={14} />
                            <span>by <span className="font-semibold text-fuchsia-600">Harshal Hire</span></span>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;