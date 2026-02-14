import {
    FaCheckCircle, FaUserShield, FaChartLine, FaUserPlus, FaBrain,
    FaLightbulb, FaRocket, FaHandshake, FaGlobeAmericas, FaAward,
    FaClock, FaLaptopCode, FaMobileAlt, FaDatabase, FaServer, FaCode,
    FaRobot, FaCertificate, FaTrophy, FaLayerGroup, FaLock,
    FaUserGraduate, FaChalkboardTeacher, FaSignInAlt, FaListAlt, FaPoll
} from "react-icons/fa";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const About = () => {
    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-800">

            {/* 1. Hero Section & Who We Are */}
            <section className="relative pt-6 pb-16 md:pt-10 md:pb-20 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            <div className="inline-block px-4 py-2 bg-amber-50 rounded-full border border-amber-100/50">
                                <span className="text-amber-600 font-bold text-xs tracking-[0.2em] uppercase">About The Project</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-[1000] text-slate-900 leading-[1.1] tracking-tight">
                                Empowering Learners Through <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Smart Quizzes</span>
                            </h1>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900">Who We Are</h3>
                                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                    The Quiz Management System is a comprehensive web-based platform designed to offer students, teachers, and institutions a seamless way to test and improve knowledge through interactive assessments. We bridge the gap between traditional testing and digital innovation.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] md:aspect-square max-w-lg mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50/50 relative z-10 group">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
                                    alt="About QuizPro Team"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent">
                                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                                        <div className="text-3xl font-black mb-2">Our Mission</div>
                                        <p className="text-sm text-white/90 leading-relaxed font-medium">
                                            "To make learning engaging, accessible, and the assessment process fast, fair, and effective for everyone."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Target Audience (User Roles) - NEW ADDITION */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-amber-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Target Audience</span>
                        <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900">Who is this for?</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Student Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-indigo-500 rounded-2xl text-white flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/30">
                                    <FaUserGraduate />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-6">For Students</h3>
                                <ul className="space-y-4">
                                    {[
                                        "Attempt unlimited interactive quizzes",
                                        "Track performance & progress over time",
                                        "Compete on global leaderboards",
                                        "Review detailed answer explanations"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                            <FaCheckCircle className="text-indigo-500 flex-shrink-0 mt-1" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Admin Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-amber-500 rounded-2xl text-white flex items-center justify-center text-3xl mb-6 shadow-lg shadow-amber-500/30">
                                    <FaChalkboardTeacher />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-6">For Teachers & Admins</h3>
                                <ul className="space-y-4">
                                    {[
                                        "Create & manage quizzes with ease",
                                        "Control user access & secure authentication",
                                        "View deep analytics & result reports",
                                        "Manage question banks effectively"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                            <FaCheckCircle className="text-amber-500 flex-shrink-0 mt-1" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* 3. Key Features */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">System Capabilities</span>
                        <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900 mb-6">Key Features</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <FaLaptopCode />, title: "Online Quiz Creation", desc: "Easily create and manage quizzes with diverse question types." },
                            { icon: <FaClock />, title: "Timer Based Tests", desc: "Real-time countdowns to simulate exam environments." },
                            { icon: <FaChartLine />, title: "Instant Results", desc: "Automated grading and immediate performance feedback." },
                            { icon: <FaLock />, title: "Secure Login", desc: "Role-based authentication ensuring data privacy and safety." },
                            { icon: <FaUserShield />, title: "Admin Dashboard", desc: "Comprehensive controls for managing users, quizzes, and data." },
                            { icon: <FaMobileAlt />, title: "Responsive Design", desc: "Seamless experience across desktops, tablets, and mobiles." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:border-amber-500/30 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-amber-50 rounded-xl text-amber-600 flex items-center justify-center mb-6 text-xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. How It Works - NEW ADDITION */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                {/* Backgrounds */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-blue-400 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Simple Workflow</span>
                        <h2 className="text-3xl md:text-5xl font-[1000]">How It Works</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-1 bg-gradient-to-r from-slate-700 via-blue-500 to-slate-700 rounded-full opacity-50"></div>

                        {[
                            { step: "01", icon: <FaSignInAlt />, title: "Register & Login", desc: "Create your secure account to get access to all quizzes." },
                            { step: "02", icon: <FaListAlt />, title: "Select & Attempt", desc: "Choose a category, start the timer, and take the quiz." },
                            { step: "03", icon: <FaPoll />, title: "Get Instant Results", desc: "Submit your answers and view your score immediately." }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 text-center group">
                                <div className="w-28 h-28 mx-auto bg-slate-800 rounded-full border-4 border-slate-700 flex flex-col items-center justify-center mb-8 group-hover:border-blue-500 group-hover:bg-slate-700 transition-all duration-300 shadow-2xl shadow-black/50">
                                    <div className="text-2xl text-blue-400 mb-1">{item.icon}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.step}</div>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-base max-w-xs mx-auto leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Why Choose Us & Tech Stack */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-amber-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">The Advantage</span>
                            <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900 mb-8">Why Choose Us?</h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Easy to Use", desc: "Intuitive interface designed for users of all technical levels." },
                                    { title: "Highly Secure", desc: "Advanced protection for user data and exam integrity." },
                                    { title: "Scalable Architecture", desc: "Built to handle growing numbers of users and quizzes." },
                                    { title: "Modern UI/UX", desc: "Aesthetically pleasing and user-friendly experience." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <FaCheckCircle />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                                            <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20"></div>

                            <h3 className="text-2xl font-bold mb-8 relative z-10">Technology Stack</h3>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <FaCode className="text-blue-400 mb-3 text-2xl" />
                                    <div className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-1">Frontend</div>
                                    <div className="font-bold text-lg">React.js</div>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <FaServer className="text-green-400 mb-3 text-2xl" />
                                    <div className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-1">Backend</div>
                                    <div className="font-bold text-lg">Node.js</div>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <FaDatabase className="text-amber-400 mb-3 text-2xl" />
                                    <div className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-1">Database</div>
                                    <div className="font-bold text-lg">MongoDB</div>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <FaLayerGroup className="text-purple-400 mb-3 text-2xl" />
                                    <div className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-1">Tools</div>
                                    <div className="font-bold text-lg">Git & VS Code</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>




            {/* 6. Our Core Values - NEW ADDITION */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-slate-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Our Philosophy</span>
                        <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900 mb-8">Core Values</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Innovation", desc: "We constantly push for new and better ways to assess knowledge.", color: "bg-blue-500" },
                            { title: "Integrity", desc: "We ensure fairness and honesty in every quiz result.", color: "bg-emerald-500" },
                            { title: "User-Centric", desc: "Everything we build is designed with the user experience in mind.", color: "bg-amber-500" }
                        ].map((val, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-10 rounded-[2rem] shadow-lg border border-slate-100 text-center relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 left-0 w-full h-2 \${val.color}`}></div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{val.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Footer */}
            <Footer />

        </div>
    );
};

export default About;