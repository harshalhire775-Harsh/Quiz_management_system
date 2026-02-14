import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FaCheckCircle, FaUserShield, FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook, FaTwitter, FaPlay, FaUserPlus, FaHeart, FaBrain, FaChevronDown, FaReact, FaNodeJs, FaHtml5, FaCss3, FaServer, FaDatabase, FaJs, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
const Home = () => {
    const navigate = useNavigate();
    const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
    const [contactStatus, setContactStatus] = useState('idle'); // idle, sending, success, error
    const [activeStep, setActiveStep] = useState(0);
    const [activeFaq, setActiveFaq] = useState(null);

    const handleContactchange = (e) => setContactData({ ...contactData, [e.target.name]: e.target.value });

    const handleContactSubmit = async (e) => {
        e.preventDefault();

        // Confirmation Popup
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to send this message?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b', // Amber-500
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, send it!',
            background: '#1a1c23', // Dark background
            color: '#fff', // White text
            showClass: {
                popup: `
                  animate__animated
                  animate__fadeInDown
                  animate__faster
                `
            },
            hideClass: {
                popup: `
                  animate__animated
                  animate__fadeOutUp
                  animate__faster
                `
            }
        });

        if (result.isConfirmed) {
            setContactStatus('sending');
            try {
                await API.post('/contact', contactData);
                setContactStatus('success');
                setContactData({ name: '', email: '', message: '' });

                // Success Popup
                Swal.fire({
                    title: 'Sent!',
                    text: 'Your message has been sent successfully.',
                    icon: 'success',
                    confirmButtonColor: '#f59e0b',
                    background: '#1a1c23',
                    color: '#fff',
                    timer: 3000,
                    timerProgressBar: true
                });
            } catch (error) {
                console.error(error);
                setContactStatus('error');

                // Error Popup
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to send message. Please try again later.',
                    icon: 'error',
                    confirmButtonColor: '#f59e0b',
                    background: '#1a1c23',
                    color: '#fff'
                });
            }
        }
    };



    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
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
        <div className="min-h-screen font-sans overflow-x-hidden bg-white text-slate-800 selection:bg-amber-500/30 selection:text-amber-800">

            {/* Background Image - Quiz/Education Theme */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-white"></div>

                {/* Main Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                        alt="Quiz Background"
                        className="w-full h-full object-cover opacity-90"
                    />
                </div>

                {/* Soft Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-amber-50/20"></div>

                {/* Subtle Technical Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center pt-16 pb-32 overflow-hidden">
                {/* Enhanced Professional Light Accents */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[140px]"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-amber-400/10 rounded-full blur-[140px]"></div>
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
                            className="inline-flex items-center gap-3 mb-6 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-[11px] tracking-[0.3em] uppercase shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse"></span>
                            The Next Gen Learning Platform
                        </motion.div>

                        <motion.h1
                            variants={fadeIn}
                            className="text-6xl md:text-8xl lg:text-[6rem] font-[1000] tracking-[-0.04em] leading-[1] mb-10 text-slate-900 drop-shadow-sm"
                        >
                            Smart Quizzes for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 inline-block">
                                Smart Minds
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeIn}
                            className="text-2xl md:text-3xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium tracking-tight"
                        >
                            Join students who are improving their knowledge through <span className="text-amber-600 font-[1000] relative px-1">
                                interactive online quizzes
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-200/40 -z-10 rounded-lg"></span>
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
                                            ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700"
                                            : "bg-white text-slate-900 border border-slate-200 shadow-xl shadow-slate-200 hover:bg-slate-50"
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



            {/* Infinite Tech Marquee */}
            {/* Infinite Tech Marquee */}
            <section className="py-12 bg-white border-y border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-20 pointer-events-none"></div>
                {/* Subtle Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-20 bg-indigo-500/5 blur-[60px] pointer-events-none"></div>

                <div className="flex overflow-hidden relative z-10">
                    <motion.div
                        className="flex gap-20 items-center whitespace-nowrap"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        style={{ width: "fit-content" }}
                    >
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-20 items-center">
                                {[
                                    { icon: <FaReact size={45} />, name: "React", color: "text-cyan-400 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" },
                                    { icon: <FaNodeJs size={45} />, name: "Node.js", color: "text-emerald-500 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" },
                                    { icon: <FaDatabase size={45} />, name: "MongoDB", color: "text-green-500 group-hover:drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" },
                                    { icon: <FaJs size={45} />, name: "JavaScript", color: "text-yellow-400 group-hover:drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" },
                                    { icon: <FaHtml5 size={45} />, name: "HTML5", color: "text-orange-500 group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" },
                                    { icon: <FaCss3 size={45} />, name: "CSS3", color: "text-blue-500 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" },
                                    { icon: <FaServer size={45} />, name: "Express", color: "text-slate-800 group-hover:text-black group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.2)]" },
                                    { icon: <FaReact size={45} />, name: "Vite", color: "text-purple-500 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" }
                                ].map((tech, idx) => (
                                    <div key={idx} className={`flex items-center gap-4 text-slate-400 font-black text-2xl uppercase tracking-widest transition-all duration-500 cursor-pointer group`}>
                                        <span className={`transform group-hover:scale-110 transition-all duration-300 ${tech.color}`}>{tech.icon}</span>
                                        <span className="opacity-70 group-hover:opacity-100 group-hover:text-slate-900 transition-all duration-300">{tech.name}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Discovery Gallery Section */}
            <section className="py-40 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-6xl md:text-7xl font-[1000] text-slate-900 tracking-tighter leading-none">
                                Learning <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Universe</span>
                            </h3>
                        </motion.div>
                        <motion.p
                            className="text-slate-600 max-w-sm font-bold text-lg leading-relaxed opacity-80"
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
                                    className="relative h-[380px] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-slate-200 bg-white shadow-xl transition-all duration-700 ease-out will-change-transform hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.2)]"
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
            <section id="features" className="py-32 bg-white relative overflow-hidden" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.h2 variants={fadeIn} className="text-amber-600 font-extrabold uppercase tracking-[0.4em] text-sm mb-6">Why QuizPro?</motion.h2>
                        <motion.h3 variants={fadeIn} className="text-5xl md:text-6xl font-[1000] text-slate-900 tracking-tight">The Future of Learning</motion.h3>
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
                                className="group p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-xl hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-500"
                            >
                                <div className={`w-20 h-20 ${feature.light} group-hover:bg-amber-500 group-hover:text-black rounded-[2rem] flex items-center justify-center mb-10 shadow-sm transition-all duration-500 group-hover:rotate-6`}>
                                    {feature.icon}
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 mb-6">{feature.title}</h4>
                                <p className="text-slate-600 font-medium leading-relaxed text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 bg-slate-50 text-slate-800 overflow-hidden relative" >
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <h2 className="text-amber-600 font-bold uppercase tracking-[0.4em] text-base mb-6">The Process</h2>
                            <h3 className="text-5xl md:text-6xl font-black mb-16 tracking-tight text-slate-900">How It Works</h3>

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
                                        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=100&w=1000"
                                    }
                                ].map((step, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveStep(i)}
                                        className={`flex gap-5 group cursor-pointer p-6 rounded-3xl transition-all duration-500 ${activeStep === i ? 'bg-white border border-slate-200 shadow-xl scale-100' : 'hover:bg-white border border-transparent'}`}
                                    >
                                        <span className={`text-5xl font-[1000] transition-colors uppercase italic ${activeStep === i ? 'text-amber-500' : 'text-slate-200 group-hover:text-amber-500/20'}`}>
                                            {step.step}
                                        </span>
                                        <div>
                                            <h4 className={`text-xl font-black mb-2 transition-colors ${activeStep === i ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                                {step.title}
                                            </h4>
                                            <p className={`text-sm max-w-md transition-colors ${activeStep === i ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-500'}`}>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative h-[450px] w-full">
                            <div className="w-full h-full absolute top-0 right-0 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
                            <div className="relative group w-full h-full overflow-hidden rounded-[3.5rem] border border-slate-200 shadow-2xl">
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
                                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=100&w=1000"
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
            </section>

            {/* Testimonials */}
            <section className="py-32 bg-white relative overflow-hidden" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-amber-600 font-bold uppercase tracking-[0.4em] text-base mb-6">Praise</h2>
                        <h3 className="text-5xl font-[1000] text-slate-900 tracking-tight">Voices of Success</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { name: "Harshal Hire", role: "UI Designer", text: "The cleanest interface I've ever worked with. It's fast, intuitive, and extremely scalable.", img: "/harshal_hire.jpg" },
                            { name: "Sarah Khan", role: "Professor", text: "My students have never been more engaged. The real-time tracking is a total game changer.", img: "/Screenshot 2026-02-10 122601.png" },
                            { name: "Harshal Patil", role: "Lead Dev", text: "The engineering behind the adaptive quizzes is top-notch. Highly recommended for all learners.", img: "/david_miller.png" }
                        ].map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-xl flex flex-col justify-between"
                            >
                                <p className="text-xl font-medium text-slate-600 italic mb-10 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-5">
                                    <img src={t.img} className="w-24 h-24 object-cover object-top rounded-3xl border-4 border-white shadow-2xl" alt={t.name} />
                                    <div>
                                        <h4 className="font-black text-slate-900 text-lg">{t.name}</h4>
                                        <p className="text-amber-600 text-xs font-bold uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Meet the Creators - 3D Tilt Section */}
            <section className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-amber-600 font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
                        >
                            The Team
                        </motion.span>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-[1000] text-slate-900 tracking-tight"
                        >
                            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Creators</span>
                        </motion.h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 perspective-[2000px] max-w-4xl mx-auto">
                        {[
                            {
                                name: "Harshal Patil",
                                role: "Lead Developer & Architect",
                                img: "david_miller.png",
                                social: ["twitter", "linkedin", "github"]
                            },
                            {
                                name: "Harshal Hire",
                                role: "UI/UX Designer",
                                img: "harshal_hire.jpg",
                                social: ["dribbble", "instagram", "linkedin"]
                            }
                        ].map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative h-[450px] w-full rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                                onMouseMove={(e) => {
                                    const el = e.currentTarget;
                                    const rect = el.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    const centerX = rect.width / 2;
                                    const centerY = rect.height / 2;
                                    const rotateX = ((y - centerY) / 20) * -1; // Invert for natural tilt
                                    const rotateY = (x - centerX) / 20;

                                    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                                }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Image Layer */}
                                <div className="absolute inset-0 z-0">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/40 to-transparent"></div>
                                </div>

                                {/* Content Layer (Floating) */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20" style={{ transform: 'translateZ(50px)' }}>
                                    <h4 className="text-2xl font-black text-white mb-2 group-hover:text-amber-500 transition-colors">{member.name}</h4>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">{member.role}</p>
                                </div>

                                {/* Border Glow */}
                                <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] group-hover:border-amber-500/50 transition-colors duration-500 pointer-events-none z-40"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stylish FAQ Section - Popup Style */}
            <section className="py-24 bg-white relative text-slate-800">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="text-amber-600 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">Got Questions?</span>
                        <h3 className="text-4xl md:text-5xl font-[1000] tracking-tight">Frequently Asked Questions</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                q: "Is QuizPro free to use?",
                                a: "Yes, absolutely! QuizPro offers a completely free tier that allows students to take unlimited quizzes and teachers to create basic assessments. We believe quality education should be accessible to everyone. For large institutions requiring advanced analytics, bulk user management, and custom branding, we offer affordable premium plans."
                            },
                            {
                                q: "How can I enhance my learning with QuizPro?",
                                a: "QuizPro is designed to be your personal learning companion. By taking quizzes across various domains, you get instant feedback on your answers. Our adaptive system identifies your weak areas and suggests relevant topics to focus on, ensuring you improve step by step every single day."
                            },
                            {
                                q: "Can teachers track individual student progress?",
                                a: "Yes! Teachers get a powerful dashboard that shows detailed performance reports for every student. You can see who completed the quiz, their scores, time taken, and even question-wise analysis. This helps you identify which students are excelling and who might need a little extra help."
                            },
                            {
                                q: "Is my personal data safe and secure?",
                                a: "Security is our top priority. We use industry-standard encryption to protect your personal information and quiz data. We never share your data with third parties without your consent, ensuring a safe and private learning environment for all our users."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveFaq(faq)}
                                className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-amber-500/30 hover:bg-white hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer group transition-all duration-300 flex flex-col justify-between"
                            >
                                <h4 className="text-xl font-bold text-slate-700 group-hover:text-amber-600 transition-colors mb-4 leading-tight">
                                    {faq.q}
                                </h4>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 group-hover:text-slate-800 uppercase tracking-wider mt-auto">
                                    <span>Read Answer</span>
                                    <FaChevronDown className="group-hover:translate-x-1 transition-transform -rotate-90" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQ Popup Modal */}
                <AnimatePresence>
                    {activeFaq && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveFaq(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            ></motion.div>
                            <motion.div
                                layoutId={`faq-${activeFaq.q}`}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative bg-white border border-slate-200 text-slate-800 p-8 md:p-12 rounded-[2.5rem] max-w-2xl w-full shadow-2xl shadow-black/20 overflow-hidden"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                                <button
                                    onClick={() => setActiveFaq(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>

                                <div className="relative z-10">
                                    <span className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 block">Answer</span>
                                    <h3 className="text-2xl md:text-3xl font-black mb-6 leading-tight text-slate-900">
                                        {activeFaq.q}
                                    </h3>
                                    <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-8"></div>
                                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                        {activeFaq.a}
                                    </p>

                                    <button
                                        onClick={() => setActiveFaq(null)}
                                        className="mt-10 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all w-full md:w-auto"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 bg-slate-50 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <div className="text-center mb-12">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-3 block"
                        >
                            Contact Us
                        </motion.span>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-black text-slate-900"
                        >
                            Let's Start a Conversation
                        </motion.h3>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                        {/* Contact Info Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                Have a question about our platform or just want to say hi? We're here to help you succeed.
                            </p>

                            <div className="space-y-4">
                                {/* Email Card */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/30 transition-all group cursor-default shadow-sm hover:shadow-lg">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <FaEnvelope size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email Us</p>
                                        <p className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">harshalhire775@gmail.com</p>
                                    </div>
                                </div>

                                {/* Phone Card */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/30 transition-all group cursor-default shadow-sm hover:shadow-lg">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <FaPhone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Call Us</p>
                                        <p className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">+91 91067 37867</p>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/30 transition-all group cursor-default shadow-sm hover:shadow-lg">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                        <FaMapMarkerAlt size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Visit Us</p>
                                        <p className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Surat, Gujarat, India</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Follow Us</h4>
                                <div className="flex gap-3">
                                    {[
                                        { icon: <FaFacebook />, link: "https://www.facebook.com/share/1Rskcpw8Xr/" },
                                        { icon: <FaTwitter />, link: "https://r.search.yahoo.com/_ylt=Awr1VTso3opp4wIAt2G7HAx.;_ylu=Y29sbwNzZzMEcG9zAzEEdnRpZAMEc2VjA3Ny/RV=2/RE=1771918121/RO=10/RU=https%3a%2f%2ftwitter.com%2f%3flang%3den-in/RK=2/RS=nMomkGCNAk4aaRVHX.815H_aFKU-" },
                                        { icon: <FaInstagram />, link: "https://www.instagram.com/harshal_1520/" }
                                    ].map((item, i) => (
                                        <a
                                            key={i}
                                            href={item.link}
                                            target={item.link !== "#" ? "_blank" : "_self"}
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white hover:-translate-y-1 transition-all duration-300"
                                        >
                                            {item.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Form Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] pointer-events-none"></div>

                            <form onSubmit={handleContactSubmit} className="space-y-4 relative z-10">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 ml-2">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={contactData.name}
                                            onChange={handleContactchange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 ml-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={contactData.email}
                                            onChange={handleContactchange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 ml-2">Your Message</label>
                                    <textarea
                                        rows="4"
                                        name="message"
                                        value={contactData.message}
                                        onChange={handleContactchange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium resize-none"
                                        placeholder="How can we help you today"
                                    ></textarea>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={contactStatus === 'sending'}
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {contactStatus === 'sending' ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Sending...
                                        </span>
                                    ) : (
                                        "Send Message"
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div >
                </div >
            </section >

            {/* Footer */}
            {/* Footer */}
            <footer className="py-12 bg-white relative border-t border-slate-100" >
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100 pt-12">
                        <p className="text-slate-500 font-bold text-sm tracking-tight">&copy; {new Date().getFullYear()} QuizPro Platform. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-sm font-bold">Built with</span>
                            <FaHeart className="text-red-500" />
                            <span className="text-slate-900 font-black text-sm uppercase tracking-widest">by Harshal Hire</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Home;