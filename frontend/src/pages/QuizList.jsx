import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Play,
    Clock,
    BarChart,
    Search,
    Filter,
    Sparkles,
    Zap,
    GraduationCap,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data } = await API.get('/quizzes');
                setQuizzes(data);
            } catch (error) {
                console.error('Failed to fetch quizzes', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    // Get unique categories
    const categories = ['All', ...new Set(quizzes.map(q => q.category))];

    // Filter quizzes
    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="mt-4 text-indigo-600 font-bold text-center">Loading...</div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-white shadow-xl shadow-indigo-500/20">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles size={14} className="text-yellow-300" />
                            Explore Knowledge
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">Available Quizzes</h2>
                        <p className="text-indigo-100 font-medium max-w-lg">
                            Choose from a variety of topics, challenge yourself, and track your progress to become a quiz master.
                        </p>
                    </div>
                    {/* Decorative Icon */}
                    <div className="hidden md:block p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 transform rotate-3 hover:rotate-6 transition-transform">
                        <GraduationCap size={64} className="text-white" />
                    </div>
                </div>

                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search for a quiz..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="relative min-w-[200px] group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>
            </motion.div>

            {/* Quiz Grid */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {filteredQuizzes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full py-20 text-center"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">No quizzes found</h3>
                            <p className="text-slate-500">Try adjusting your search terms or changing the category.</p>
                        </motion.div>
                    ) : filteredQuizzes.map((quiz) => (
                        <motion.div
                            key={quiz._id}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="group bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                    ${quiz.category === 'Programming' ? 'bg-blue-50 text-blue-600' :
                                        quiz.category === 'Science' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-slate-100 text-slate-600'
                                    }
                                `}>
                                    {quiz.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {quiz.title}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2 h-10">
                                {quiz.description || "Test your knowledge with this comprehensive quiz designed to challenge your understanding."}
                            </p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} /> {quiz.duration} mins
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart size={16} /> {quiz.numQuestions} Qs
                                    </div>
                                </div>

                                <Link
                                    to={`/quiz/${quiz._id}`}
                                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-colors"
                                >
                                    Start Quiz <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default QuizList;
