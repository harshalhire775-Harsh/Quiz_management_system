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
        <div className="container animate-fade-in" style={{ paddingBottom: '100px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '5px' }}>{quiz.title}</h2>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                    </div>
                </div>
                <Timer duration={quiz.duration} onTimeUp={handleSubmit} />
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'var(--card-bg)', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card"
                    style={{ padding: '50px' }}
                >
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '40px', lineHeight: '1.5', fontWeight: '700' }}>
                        {currentQuestion.questionText}
                    </h3>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {currentQuestion.options.map((option, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleAnswerSelect(option)}
                                style={{
                                    padding: '22px 30px',
                                    borderRadius: '18px',
                                    background: selectedAnswer === option ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.3)',
                                    border: `2px solid ${selectedAnswer === option ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    fontSize: '1.15rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {selectedAnswer === option && (
                                    <motion.div
                                        layoutId="active-bg"
                                        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--primary)' }}
                                    />
                                )}
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    border: `2px solid ${selectedAnswer === option ? 'var(--primary)' : 'var(--text-muted)'}`,
                                    background: selectedAnswer === option ? 'var(--primary)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
                                }}>
                                    {selectedAnswer === option && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white' }} />}
                                </div>
                                <span style={{ fontWeight: selectedAnswer === option ? '700' : '500' }}>{option}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
                <button
                    className="btn btn-secondary"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => { playNext(); setCurrentQuestionIndex(currentQuestionIndex - 1); }}
                    style={{ width: '160px', padding: '14px', borderRadius: '15px' }}
                >
                    <ChevronLeft size={22} /> Previous
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        className="btn btn-primary"
                        style={{ width: '160px', padding: '14px', background: 'var(--success)', borderRadius: '15px' }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        <CheckCircle size={22} /> {submitting ? 'Submitting...' : 'Finish Quiz'}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={() => { playNext(); setCurrentQuestionIndex(currentQuestionIndex + 1); }}
                        style={{ width: '160px', padding: '14px', borderRadius: '15px' }}
                    >
                        Next <ChevronRight size={22} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizStart;
