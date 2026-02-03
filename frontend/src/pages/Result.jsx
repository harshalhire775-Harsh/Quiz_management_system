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
        <div className="container animate-fade-in" style={{ padding: '60px 20px', minHeight: '80vh' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ maxWidth: '800px', margin: '0 auto' }}
            >
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(50px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--secondary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(50px)' }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0, transition: { type: 'spring' } }}
                            style={{ marginBottom: '30px' }}
                        >
                            <div style={{ width: '100px', height: '100px', margin: '0 auto', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)' }}>
                                <Trophy size={50} color="#f59e0b" />
                            </div>
                        </motion.div>

                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>
                            {percentage >= 80 ? 'Mastery Unlocked! 🏆' : percentage >= 50 ? 'Well Done! 🌟' : 'Challenge Accepted? 💪'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '50px' }}>
                            Achieved in: <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{result.quiz?.title}</span>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '25px', marginBottom: '60px' }}>
                            <div style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                <Star color="#f59e0b" size={24} style={{ marginBottom: '10px' }} />
                                <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{result.score}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Correct Answer</div>
                            </div>
                            <div style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                <Zap color="#06b6d4" size={24} style={{ marginBottom: '10px' }} />
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: percentage >= 50 ? 'var(--success)' : 'var(--error)' }}>{Math.round(percentage)}%</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Efficiency</div>
                            </div>
                            <div style={{ padding: '30px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                <Medal color="#ec4899" size={24} style={{ marginBottom: '10px' }} />
                                <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{result.totalQuestions}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Tasks</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={shareOnWhatsApp} className="btn btn-primary" style={{ padding: '16px 30px', fontSize: '1rem', background: '#22c55e', border: 'none', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Share2 size={20} /> Share on WhatsApp
                            </button>
                            <Link to={`/review/${id}`} className="btn btn-primary" style={{ padding: '16px 30px', fontSize: '1rem' }}>
                                <Eye size={20} /> Review Journey
                            </Link>
                            <Link to="/quizzes" className="btn btn-secondary" style={{ padding: '16px 30px', fontSize: '1rem' }}>
                                <RefreshCw size={20} /> Next Challenge
                            </Link>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <ArrowLeft size={18} /> Back to Hub
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Result;
