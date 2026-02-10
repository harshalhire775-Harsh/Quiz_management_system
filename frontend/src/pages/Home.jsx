import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FaCheckCircle, FaUserShield, FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTwitter, FaPlay, FaUserPlus, FaHeart, FaBrain } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
const Home = () => {
    const navigate = useNavigate();
    const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
    const [contactStatus, setContactStatus] = useState('idle'); // idle, sending, success, error
    const [activeStep, setActiveStep] = useState(0);

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
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2000"
    ];

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, []);

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
        <div className="min-h-screen font-sans overflow-x-hidden bg-[#0a0c10] text-slate-200 selection:bg-amber-500/30 selection:text-amber-200">

            {/* Background Pattern - Immersive Dynamic Slider */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#0a0c10]">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={heroImages[currentImageIndex]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="w-full h-full object-cover contrast-[1.15] saturate-[1.2] brightness-[0.85]"
                            alt="Background"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-[#0a0c10]/80"></div>
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            </div>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center pt-16 pb-32 overflow-hidden">
                {/* Enhanced Professional Light Accents */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-400/5 rounded-full blur-[140px]"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-cyan-400/5 rounded-full blur-[140px]"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center justify-center">

                    <motion.div
                        className="w-full text-center flex flex-col items-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div
                            variants={fadeIn}
                            className="inline-flex items-center gap-3 mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-700 font-bold text-[11px] tracking-[0.3em] uppercase backdrop-blur-xl shadow-lg shadow-amber-500/10 relative overflow-hidden group"
                        >
                            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse"></span>
                            The Next Gen Learning Platform
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </motion.div>

                        <motion.h1
                            variants={fadeIn}
                            className="text-5xl md:text-7xl lg:text-[5.5rem] font-[1000] tracking-[-0.05em] leading-[1.1] mb-10"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 inline-block drop-shadow-lg">
                                Smart Quizzes for <br /> Smart Minds
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeIn}
                            className="text-2xl md:text-3xl text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed font-semibold tracking-tight"
                        >
                            Join students who are improving their knowledge through <span className="text-amber-500 font-[1000] relative px-1">
                                interactive online quizzes
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-500/20 -z-10 rounded-lg"></span>
                            </span> and instant results.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-6 relative">
                            {['Login Your Account', 'Register Your Account'].map((label, idx) => (
                                <motion.div
                                    key={label}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group"
                                >
                                    <motion.button
                                        onClick={() => navigate(idx === 0 ? '/quizzes' : '/register')}
                                        className={`${idx === 0
                                            ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                            : "bg-white text-slate-900 shadow-xl shadow-white/10"
                                            } px-10 py-5 rounded-2xl text-lg font-[1000] transition-all flex items-center justify-center gap-3 z-10 relative overflow-hidden group`}
                                    >
                                        {label}
                                        {idx === 0 && <FaPlay size={12} className="opacity-70" />}
                                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                    </motion.button>
                                    <div className={`absolute -inset-1 ${idx === 0 ? 'bg-blue-400/20' : 'bg-white/10'} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`}></div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Decorative Background Spotlight */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
                    >
                        <div
                            className="absolute w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out"
                            style={{
                                left: 'var(--mouse-x, 50%)',
                                top: 'var(--mouse-y, 50%)',
                            }}
                        ></div>
                    </motion.div>
                </div>
            </section>



            {/* Discovery Gallery Section */}
            <section className="py-40 bg-[#06070a] relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-6xl md:text-7xl font-[1000] text-white tracking-tighter leading-none">
                                Learning <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Universe</span>
                            </h3>
                        </motion.div>
                        <motion.p
                            className="text-slate-300 max-w-sm font-bold text-lg leading-relaxed opacity-80"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            Explore a Smartly Designed Quiz Management System Built by Academic Experts
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8">
                        {[
                            { img: "https://sp.yimg.com/ib/th/id/OIP.YPUAuzBjYCz4DAu1Z527UgHaEO?pid=Api&rs=1", title: "Mathematics", count: "5k+ Quizzes", col: "md:col-span-2" },
                            { img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=100&w=2000", title: "Science", count: "250+ Quizzes", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=100&w=2000", title: "Programming", count: "10k+ Quizzes", col: "md:col-span-1" },
                            { img: "https://wallpaperbat.com/img/16916-environmental-science-copy-by-michelle-knight-educational-games.jpg", title: "Environmental Science", count: "300+ Quizzes", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=100&w=2000", title: "Technology", count: "300+ Quizzes", col: "md:col-span-1" },
                            { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=100&w=2000", title: "Languages", count: "150+ Quizzes", col: "md:col-span-1" },
                            { img: "https://plus.unsplash.com/premium_photo-1681426678542-613c306013e1?auto=format&fit=crop&q=100&w=2000", title: "Chemistry", count: "10k+ Quizzes", col: "md:col-span-1" },
                            { img: "https://tse2.mm.bing.net/th/id/OIP.QdlKwNFK__6dhezNNdY6VAHaHa?pid=Api&P=0&h=180", title: "Aptitude & Reasoning", count: "2k+ Quizzes", col: "md:col-span-2" }
                        ].map((item, i) => {
                            // Professional Mouse Tracking for 3D Tilt
                            const handleMouseMove = (e) => {
                                const el = e.currentTarget;
                                const rect = el.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                const centerX = rect.width / 2;
                                const centerY = rect.height / 2;
                                const rotateX = (y - centerY) / 10;
                                const rotateY = (centerX - x) / 10;

                                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                                const overlay = el.querySelector('.glare-effect');
                                if (overlay) {
                                    overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 80%)`;
                                }
                            };

                            const handleMouseLeave = (e) => {
                                const el = e.currentTarget;
                                el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                                const overlay = el.querySelector('.glare-effect');
                                if (overlay) {
                                    overlay.style.background = `transparent`;
                                }
                            };

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 100, scale: 0.8, rotateX: -45 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                    transition={{
                                        delay: i * 0.1,
                                        duration: 0.8,
                                        type: "spring",
                                        bounce: 0.5
                                    }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    viewport={{ once: false, margin: "-50px" }}
                                    className="relative h-[380px] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 bg-[#0a0c10] shadow-2xl transition-all duration-700 ease-out will-change-transform hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.2)]"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Cinematic Image Layer */}
                                    <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] z-0">
                                        <motion.img
                                            src={item.img}
                                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-125"
                                            alt={item.title}
                                            style={{ transform: 'translateZ(-50px)', backfaceVisibility: 'hidden' }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-700"></div>
                                    </div>

                                    {/* Glass Glare Overlay */}
                                    <div className="glare-effect absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay"></div>

                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 z-10"></div>

                                    {/* Floating Text Content with slide-up effect */}
                                    <div className="absolute bottom-10 left-8 z-30 transform transition-transform duration-500 group-hover:-translate-y-2" style={{ transform: 'translateZ(40px)' }}>
                                        <h4 className="text-3xl font-[1000] text-white tracking-tighter drop-shadow-2xl mb-2 group-hover:text-amber-400 transition-colors duration-300">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="h-1 w-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
                                            <p className="text-slate-300 text-[11px] font-black uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                                                {item.count}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Active Border Glow */}
                                    <div className="absolute inset-0 border border-white/10 group-hover:border-amber-500/50 rounded-[2.5rem] transition-colors duration-500 pointer-events-none z-40"></div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section >



            {/* Features Section */}
            <section id="features" className="py-32 bg-[#06070a] relative overflow-hidden" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.h2 variants={fadeIn} className="text-amber-500 font-extrabold uppercase tracking-[0.4em] text-sm mb-6">Why QuizPro?</motion.h2>
                        <motion.h3 variants={fadeIn} className="text-5xl md:text-6xl font-[1000] text-white tracking-tight">The Future of Learning</motion.h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <FaBrain size={32} />,
                                title: "Adaptive Quiz System",
                                desc: "Quizzes are designed to match the user’s knowledge level, helping students improve step by step without pressure.",
                                color: "bg-amber-500",
                                light: "bg-amber-500/10 text-amber-500"
                            },
                            {
                                icon: <FaChartLine size={32} />,
                                title: "Live Analytics",
                                desc: "Get instant results and clear performance insights through real-time score calculation and progress tracking.",
                                color: "bg-amber-500",
                                light: "bg-amber-500/10 text-amber-500"
                            },
                            {
                                icon: <FaUserShield size={32} />,
                                title: "Secure & Fast",
                                desc: "QuizPro provides secure authentication and fast system performance for a smooth and reliable quiz experience.",
                                color: "bg-amber-500",
                                light: "bg-amber-500/10 text-amber-500"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -15 }}
                                className="group p-12 rounded-[3.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] transition-all duration-500"
                            >
                                <div className={`w-20 h-20 ${feature.light} group-hover:bg-amber-500 group-hover:text-black rounded-[2rem] flex items-center justify-center mb-10 shadow-sm transition-all duration-500 group-hover:rotate-6`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-3xl font-black text-white mb-6">{feature.title}</h4>
                                <p className="text-slate-400 font-medium leading-relaxed text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 bg-[#06070a] text-white overflow-hidden relative" >
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#06070a] to-transparent"></div>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <h2 className="text-amber-500 font-bold uppercase tracking-[0.4em] text-base mb-6">The Process</h2>
                            <h3 className="text-5xl md:text-6xl font-black mb-16 tracking-tight">How It Works</h3>

                            <div className="space-y-5">
                                {[
                                    {
                                        step: "01",
                                        title: "Instant Registration",
                                        desc: "Join our global community in seconds and set your learning goals.",
                                        img: "/register_demo.png"
                                    },
                                    {
                                        step: "02",
                                        title: "Select Your Domain",
                                        desc: "Pick from 500+ verified categories and start challenging yourself.",
                                        img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000"
                                    },
                                    {
                                        step: "03",
                                        title: "Master & Track",
                                        desc: "Get real-time feedback and watch your skills climb the global leaderboard.",
                                        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
                                    }
                                ].map((step, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveStep(i)}
                                        className={`flex gap-5 group cursor-pointer p-6 rounded-3xl transition-all duration-500 ${activeStep === i ? 'bg-white/10 border border-white/10 shadow-2xl scale-100' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <span className={`text-5xl font-[1000] transition-colors uppercase italic ${activeStep === i ? 'text-amber-500' : 'text-white/5 group-hover:text-amber-500/20'}`}>
                                            {step.step}
                                        </span>
                                        <div>
                                            <h4 className={`text-xl font-black mb-2 transition-colors ${activeStep === i ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                                {step.title}
                                            </h4>
                                            <p className={`text-sm max-w-md transition-colors ${activeStep === i ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative h-[450px] w-full">
                            <div className="w-full h-full absolute top-0 right-0 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
                            <div className="relative group w-full h-full overflow-hidden rounded-[3.5rem] border border-white/10 shadow-2xl">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeStep}
                                        initial={{ opacity: 0, scale: 1.2, x: 100, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, scale: 0.8, x: -100, filter: "blur(10px)" }}
                                        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                                        src={[
                                            "/register_demo.png",
                                            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000",
                                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
                                        ][activeStep]}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        alt="Process Step"
                                    />
                                </AnimatePresence>
                                {/* Floating Badge */}
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Testimonials */}
            <section className="py-32 bg-[#06070a] relative overflow-hidden" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-amber-500 font-bold uppercase tracking-[0.4em] text-base mb-6">Praise</h2>
                        <h3 className="text-5xl font-[1000] text-white tracking-tight">Voices of Success</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { name: "Harshal Hire", role: "UI Designer", text: "The cleanest interface I've ever worked with. It's fast, intuitive, and extremely scalable.", img: "/harshal_hire.jpg" },
                            { name: "Sarah Khan", role: "Professor", text: "My students have never been more engaged. The real-time tracking is a total game changer.", img: "https://randomuser.me/api/portraits/women/2.jpg" },
                            { name: "David Miller", role: "Lead Dev", text: "The engineering behind the adaptive quizzes is top-notch. Highly recommended for all learners.", img: "/david_miller.png" }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 flex flex-col justify-between"
                            >
                                <p className="text-xl font-medium text-slate-300 italic mb-10 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-5">
                                    <img src={t.img} className="w-24 h-24 object-cover object-top rounded-3xl border-4 border-white/5 shadow-2xl" alt={t.name} />
                                    <div>
                                        <h4 className="font-black text-white text-lg">{t.name}</h4>
                                        <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Contact Section */}
            <section id="contact" className="py-32 bg-[#06070a] relative overflow-hidden" >
                <div className="container mx-auto px-6 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden flex flex-col lg:flex-row"
                    >
                        {/* Info */}
                        <div className="bg-black/40 lg:w-5/12 p-16 text-white flex flex-col justify-between relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
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
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
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
                        <div className="flex-1 p-16 bg-white/5">
                            <form onSubmit={handleContactSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-4">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={contactData.name}
                                            onChange={handleContactchange}
                                            required
                                            className="w-full px-6 py-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-amber-500 transition-all outline-none font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-4">Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactData.email}
                                            onChange={handleContactchange}
                                            required
                                            className="w-full px-6 py-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-amber-500 transition-all outline-none font-bold"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 pl-4">Your Message</label>
                                    <textarea
                                        rows="4"
                                        name="message"
                                        value={contactData.message}
                                        onChange={handleContactchange}
                                        required
                                        className="w-full px-6 py-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-amber-500 transition-all outline-none font-bold resize-none"
                                        placeholder="How can we help you today?"
                                    ></textarea>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={contactStatus === 'sending'}
                                    className="w-full py-6 bg-amber-500 text-black rounded-3xl font-[1000] text-xl shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] hover:bg-amber-600 transition-all"
                                >
                                    {contactStatus === 'sending' ? "Sending..." : "Send Message"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section >

            {/* Footer */}
            <footer className="py-12 bg-[#06070a] relative border-t border-white/5" >
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12">
                        <p className="text-slate-500 font-bold text-sm tracking-tight">&copy; {new Date().getFullYear()} QuizPro Platform. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-sm font-bold">Built with</span>
                            <FaHeart className="text-red-500" />
                            <span className="text-white font-black text-sm uppercase tracking-widest">by Harshal Hire</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Home;