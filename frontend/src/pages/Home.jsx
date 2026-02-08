import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FaCheckCircle, FaUserShield, FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTwitter, FaPlay, FaUserPlus, FaHeart, FaBrain } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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

    const heroImages = [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000",
        "/1.png"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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

            {/* Background Pattern - Immersive Dynamic Slider */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#0a0c10]">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={heroImages[currentImageIndex]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="w-full h-full object-cover"
                            alt="Background"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0a0c10]"></div>
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            </div>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center pt-28 pb-32 overflow-hidden">
                {/* Enhanced Professional Light Accents */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/15 rounded-full blur-[160px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[160px]"></div>
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-400/5 via-transparent to-transparent"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center justify-center">

                    <motion.div
                        className="w-full text-center flex flex-col items-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full bg-white/5 border border-white/20 text-cyan-300 font-bold text-[11px] tracking-[0.3em] uppercase backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"></span>
                            The Next Gen Learning Platform
                        </motion.div>

                        <motion.h1
                            variants={fadeIn}
                            className="text-7xl md:text-8xl lg:text-[8.5rem] font-[1000] tracking-[-0.05em] leading-[0.9] mb-14 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            Master your <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 filter drop-shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                                Knowledge
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeIn}
                            className="text-2xl md:text-3xl text-slate-300 mb-20 max-w-4xl mx-auto leading-relaxed font-semibold tracking-tight opacity-90"
                        >
                            Join <span className="text-white font-[1000] relative">
                                10,000+ elite learners
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500/40 blur-[2px]"></span>
                            </span> mastering subjects through hyper-interactive quizzes and real-time deep analytics.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-8 relative">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/quizzes')}
                                className="bg-blue-600 text-white px-14 py-7 rounded-3xl text-xl font-[1000] shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center justify-center gap-4 z-10"
                            >
                                Start Learning
                                <FaPlay size={14} className="opacity-70" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/register')}
                                className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-14 py-7 rounded-3xl text-xl font-[1000] hover:bg-white/10 transition-all z-10"
                            >
                                Join Global Community
                            </motion.button>

                        </motion.div>

                        {/* Trust Badge */}
                        <motion.div variants={fadeIn} className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="text-xl font-black text-white italic tracking-tighter">TRUSTED BY</div>
                            <div className="flex items-center gap-10 font-bold text-slate-500 text-lg">
                                <span>Google</span>
                                <span>Coursera</span>
                                <span>Khan Academy</span>
                                <span>Udemy</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Decorative Overlay */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 rounded-full blur-[100px]"></div>
                </div>
            </section>

            {/* Expanded Discovery Gallery - REVERTED IMAGES */}
            <section className="py-40 bg-[#0a0c10] relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-blue-500 font-[1000] uppercase tracking-[0.4em] text-[10px] mb-6">Discovery</h2>
                            <h3 className="text-6xl md:text-7xl font-[1000] text-white tracking-tighter leading-none">
                                Learning <br /> <span className="opacity-30">Universe</span>
                            </h3>
                        </motion.div>
                        <motion.p
                            className="text-slate-500 max-w-sm font-bold text-lg leading-relaxed"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            Dive into a meticulously curated collection of knowledge crafted by the world's leading academic experts.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {[
                            { img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800", title: "Humanities", count: "12k+ Records", col: "md:col-span-2" },
                            { img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800", title: "Science", count: "250+ Quizzes", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800", title: "Programming", count: "10k+ Courses", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800", title: "Technology", count: "300+ Quizzes", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800", title: "Visual Arts", count: "500+ Studios", col: "md:col-span-2" },
                            { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800", title: "Languages", count: "150+ Quizzes", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1454165833767-1300961440cc?auto=format&fit=crop&q=80&w=800", title: "Business", count: "15k+ Cases", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800", title: "Research", count: "10k+ Courses", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800", title: "Global Study", count: "2k+ Groups", col: "md:col-span-2" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className={`relative h-[300px] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 ${item.col}`}
                            >
                                <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                                <div className="absolute bottom-10 left-10">
                                    <h4 className="text-3xl font-[1000] text-white mb-2 tracking-tight">{item.title}</h4>
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">{item.count}</p>
                                </div>
                                <div className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-white">
                                    <FaPlay size={10} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Features Section */}
            < section id="features" className="py-32 bg-white relative overflow-hidden" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.h2 variants={fadeIn} className="text-blue-600 font-extrabold uppercase tracking-[0.3em] text-[10px] mb-4">Why QuizPro?</motion.h2>
                        <motion.h3 variants={fadeIn} className="text-5xl md:text-6xl font-[1000] text-slate-900 tracking-tight">The Future of Learning</motion.h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <FaBrain size={32} />,
                                title: "Adaptive AI",
                                desc: "Quizzes that evolve with your skill level, ensuring you always stay challenged but never overwhelmed.",
                                color: "bg-blue-600",
                                light: "bg-blue-50 text-blue-600"
                            },
                            {
                                icon: <FaChartLine size={32} />,
                                title: "Live Analytics",
                                desc: "Deep insights into your learning patterns with 100% accurate real-time data visualization.",
                                color: "bg-indigo-600",
                                light: "bg-indigo-50 text-indigo-600"
                            },
                            {
                                icon: <FaUserShield size={32} />,
                                title: "Secure & Fast",
                                desc: "Enterprise-grade security and lighting-fast performance for a seamless experience.",
                                color: "bg-fuchsia-600",
                                light: "bg-fuchsia-50 text-fuchsia-600"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -15 }}
                                className="group p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] transition-all duration-500"
                            >
                                <div className={`w-20 h-20 ${feature.light} group-hover:bg-blue-600 group-hover:text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-sm transition-all duration-500 group-hover:rotate-6`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 mb-6">{feature.title}</h4>
                                <p className="text-slate-500 font-medium leading-relaxed text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* How It Works */}
            < section className="py-32 bg-[#0a0c10] text-white overflow-hidden relative" >
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">The Process</h2>
                            <h3 className="text-5xl md:text-6xl font-black mb-16 tracking-tight">How It Works</h3>

                            <div className="space-y-12">
                                {[
                                    { step: "01", title: "Instant Registration", desc: "Join our global community in seconds and set your learning goals." },
                                    { step: "02", title: "Select Your Domain", desc: "Pick from 500+ verified categories and start challenging yourself." },
                                    { step: "03", title: "Master & Track", desc: "Get real-time feedback and watch your skills climb the global leaderboard." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <span className="text-6xl font-[1000] text-white/5 group-hover:text-blue-500/20 transition-colors uppercase italic">{step.step}</span>
                                        <div>
                                            <h4 className="text-2xl font-black mb-3">{step.title}</h4>
                                            <p className="text-slate-400 font-medium max-w-md">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="w-full aspect-square bg-blue-600/10 rounded-full absolute top-10 right-10 blur-[120px] animate-pulse"></div>
                            <div className="relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000"
                                    className="rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative z-10 border border-white/10 group-hover:scale-[1.02] transition-transform duration-700"
                                    alt="Online Test Demo"
                                />
                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -top-8 -right-8 z-20 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl skew-y-1"
                                >
                                    Real-time Sync
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Testimonials */}
            < section className="py-32 bg-white relative overflow-hidden" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-blue-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Praise</h2>
                        <h3 className="text-5xl font-[1000] text-slate-900 tracking-tight">Voices of Success</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { name: "Harshal Hire", role: "UI Designer", text: "The cleanest interface I've ever built with. It's fast, intuitive, and extremely scalable.", img: "https://randomuser.me/api/portraits/men/1.jpg" },
                            { name: "Sarah Khan", role: "Professor", text: "My students have never been more engaged. The real-time tracking is a total game changer.", img: "https://randomuser.me/api/portraits/women/2.jpg" },
                            { name: "David Miller", role: "Lead Dev", text: "The engineering behind the adaptive quizzes is top-notch. Highly recommended for all learners.", img: "https://randomuser.me/api/portraits/men/3.jpg" }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 flex flex-col justify-between"
                            >
                                <p className="text-xl font-medium text-slate-600 italic mb-10 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-5">
                                    <img src={t.img} className="w-16 h-16 rounded-2xl border-2 border-white shadow-md" alt={t.name} />
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg">{t.name}</h4>
                                        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Contact Section */}
            < section id="contact" className="py-32 bg-slate-50 relative overflow-hidden" >
                <div className="container mx-auto px-6 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row"
                    >
                        {/* Info */}
                        <div className="bg-[#0a0c10] lg:w-5/12 p-16 text-white flex flex-col justify-between relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
                            <div>
                                <h3 className="text-4xl font-black mb-8 italic">Get in Touch</h3>
                                <p className="text-white/60 mb-12 text-lg">Have questions? Our support team is here 24/7 to help you succeed.</p>

                                <div className="space-y-8">
                                    {[
                                        { icon: <FaEnvelope />, text: "support@quizpro.com" },
                                        { icon: <FaPhone />, text: "+91 91067 37867" },
                                        { icon: <FaMapMarkerAlt />, text: "Surat, Gujarat, India" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-5 group cursor-pointer">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                                {item.icon}
                                            </div>
                                            <span className="font-medium text-white/80 group-hover:text-white transition-colors">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-16">
                                {[<FaFacebook />, <FaTwitter />, <FaInstagram />].map((icon, i) => (
                                    <div key={i} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                                        {icon}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="flex-1 p-16 bg-white">
                            <form onSubmit={handleContactSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-4">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={contactData.name}
                                            onChange={handleContactchange}
                                            required
                                            className="w-full px-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-4">Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactData.email}
                                            onChange={handleContactchange}
                                            required
                                            className="w-full px-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-4">Your Message</label>
                                    <textarea
                                        rows="4"
                                        name="message"
                                        value={contactData.message}
                                        onChange={handleContactchange}
                                        required
                                        className="w-full px-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold resize-none"
                                        placeholder="How can we help you today?"
                                    ></textarea>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={contactStatus === 'sending'}
                                    className="w-full py-6 bg-blue-600 text-white rounded-3xl font-[1000] text-xl shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all"
                                >
                                    {contactStatus === 'sending' ? "Sending..." : "Send Message"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section >

            {/* Footer */}
            < footer className="py-12 bg-white relative" >
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100 pt-12">
                        <p className="text-slate-400 font-bold text-sm tracking-tight">&copy; {new Date().getFullYear()} QuizPro Platform. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm font-bold">Built with</span>
                            <FaHeart className="text-red-500" />
                            <span className="text-slate-800 font-black text-sm uppercase tracking-widest">by Harshal Hire</span>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
};

export default Home;