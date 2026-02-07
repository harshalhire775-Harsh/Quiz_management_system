import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import useSound from 'use-sound';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import Timer from '../components/Timer';

const QuizStart = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Audio SFX
    const [playSelect] = useSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', { volume: 0.5, soundEnabled });
    const [playNext] = useSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', { volume: 0.4, soundEnabled });
    const [playFinish] = useSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', { volume: 0.6, soundEnabled });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quizRes = await API.get(`/quizzes/${id}`);
                const questionsRes = await API.get(`/questions/quiz/${id}`);
                setQuiz(quizRes.data);
                setQuestions(questionsRes.data);
            } catch (error) {
                console.error('Failed to fetch quiz details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAnswerSelect = (selectedOption) => {
        playSelect();
        const newAnswers = [...answers];
        const existingAnswerIndex = newAnswers.findIndex(
            (a) => a.questionId === questions[currentQuestionIndex]._id
        );

        if (existingAnswerIndex !== -1) {
            newAnswers[existingAnswerIndex].selectedAnswer = selectedOption;
        } else {
            newAnswers.push({
                questionId: questions[currentQuestionIndex]._id,
                selectedAnswer: selectedOption,
            });
        }
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (submitting) return;
        playFinish();
        setSubmitting(true);
        try {
            const { data } = await API.post('/results', {
                quizId: id,
                answers,
            });
            navigate(`/result/${data._id}`);
        } catch (error) {
            console.error('Failed to submit result', error);
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Loading Quiz Questions...</h1></div>;
    if (!quiz || questions.length === 0) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>No questions found for this quiz.</h1></div>;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers.find((a) => a.questionId === currentQuestion._id)?.selectedAnswer;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-500/30 selection:text-indigo-900 pb-20 pt-10 px-4">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-100/50 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em]">
                                QUESTION {currentQuestionIndex + 1} OF {questions.length}
                            </span>
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`p-2 rounded-xl transition-all ${soundEnabled ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-100'}`}
                                title={soundEnabled ? "Disable Sound" : "Enable Sound"}
                            >
                                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </button>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            {quiz.title}
                        </h1>
                    </div>

                    <div className="w-full md:w-auto">
                        <Timer duration={quiz.duration} onTimeUp={handleSubmit} />
                    </div>
                </motion.div>

                {/* Main Quiz Area */}
                <div className="relative">
                    {/* Visual Progress Line */}
                    <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            className="w-full bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 md:p-12"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-[1.4]">
                                {currentQuestion.questionText}
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswer === option;
                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleAnswerSelect(option)}
                                            className={`relative flex items-center gap-5 p-6 rounded-2xl text-left transition-all duration-300 group ${isSelected
                                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-white border-2 border-transparent hover:border-indigo-100'
                                                }`}
                                        >
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black transition-all ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-400 border border-slate-200 group-hover:border-indigo-200'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>

                                            <span className="text-lg font-bold flex-1">{option}</span>

                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center"
                                                >
                                                    <CheckCircle size={16} weight="fill" />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center mt-10"
                >
                    <button
                        onClick={() => { playNext(); setCurrentQuestionIndex(prev => prev - 1); }}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-0 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all">
                            <ChevronLeft size={20} />
                        </div>
                        <span className="text-slate-500 group-hover:text-indigo-600">Previous</span>
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all group disabled:opacity-50"
                        >
                            <CheckCircle size={22} className="group-hover:scale-110 transition-transform" />
                            {submitting ? 'Submitting...' : 'Complete Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={() => { playNext(); setCurrentQuestionIndex(prev => prev + 1); }}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-1 transition-all group"
                        >
                            Next Question
                            <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default QuizStart;
