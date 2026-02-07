import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ArrowLeft, RefreshCw, CheckCircle2, Eye, Download, Star, Medal, Zap, Share2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';
import { motion } from 'framer-motion';
import API from '../api/axios';

const Result = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playFanfare] = useSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', { volume: 0.5 });

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const myResults = await API.get('/results/myresults');
                const found = myResults.data.find(r => r._id === id);
                setResult(found);

                if (found && (found.score / found.totalQuestions) * 100 >= 80) {
                    triggerConfetti();
                    playFanfare();
                }
            } catch (error) {
                console.error('Failed to fetch result', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const shareOnWhatsApp = () => {
        const percentage = Math.round((result.score / result.totalQuestions) * 100);
        const text = `🎯 I just scored ${percentage}% in the "${result.quiz?.title}" quiz on QuizPro! \n\nCan you beat my score? Challenge yourself here: ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Generating Achievement...</h1></div>;
    if (!result) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Achievement not found.</h1></div>;

    const percentage = (result.score / result.totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 md:p-16 border border-slate-100"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Quiz Completed</h1>
                    <p className="text-slate-500 font-medium italic text-lg">{result.quiz?.title}</p>
                </div>

                {/* Simplified Score Card */}
                <div className="bg-slate-50 rounded-2xl p-8 mb-10 flex flex-col items-center">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Your Final Score</div>
                    <div className={`text-6xl font-black mb-1 ${percentage >= 50 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {result.score} <span className="text-slate-300 text-3xl">/ {result.totalQuestions}</span>
                    </div>
                    <div className="text-lg font-bold text-slate-600">
                        Accuracy: {Math.round(percentage)}%
                    </div>
                </div>

                {/* Action Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to={`/review/${id}`}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                        <Eye size={20} /> Review Answers
                    </Link>
                    <Link
                        to="/quizzes"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                    >
                        <RefreshCw size={20} /> Try Another Quiz
                    </Link>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/student-dashboard" className="text-slate-400 hover:text-indigo-600 font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Result;
