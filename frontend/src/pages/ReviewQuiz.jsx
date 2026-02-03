import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import API from '../api/axios';

const ReviewQuiz = () => {
    const { id } = useParams(); // Result ID
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch the specific result (using myresults endpoint and filtering, or a specific endpoint if available)
                // Since we don't have a direct get-result-by-id endpoint for users ensuring ownership, 
                // we iterate myresults. Ideally backend should have GET /api/results/:id
                const resultsRes = await API.get('/results/myresults');
                const foundResult = resultsRes.data.find(r => r._id === id);

                if (!foundResult) {
                    throw new Error('Result not found');
                }
                setResult(foundResult);

                // 2. Fetch the questions for this quiz
                // We need the quiz ID from the result
                if (foundResult.quiz) {
                    const quizId = typeof foundResult.quiz === 'object' ? foundResult.quiz._id : foundResult.quiz;
                    const questionsRes = await API.get(`/questions/quiz/${quizId}`);
                    setQuestions(questionsRes.data);
                }

            } catch (error) {
                console.error('Failed to load review data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Loading Review...</h1></div>;
    if (!result || !questions.length) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Review data unavailable.</h1><button className="btn btn-secondary" onClick={() => navigate(-1)}>Go Back</button></div>;

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '10px' }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Review Answers</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {result.quiz?.title} &bull; Score: {result.score}/{result.totalQuestions}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {questions.map((q, index) => {
                    // Find the user's answer for this question
                    // result.answers is an array of objects: { question: "ID", selectedAnswer: "..." }
                    // Note: result.answers elements might populate 'question' or store it as ID.
                    // Based on controller, it stores specific structure.

                    const userAnswerObj = result.answers.find(ans => {
                        const ansQId = typeof ans.question === 'object' ? ans.question._id : ans.question;
                        return ansQId === q._id;
                    });

                    const userSelected = userAnswerObj ? userAnswerObj.selectedAnswer : null;
                    const isCorrect = userSelected === q.correctAnswer;
                    const isSkipped = !userSelected;

                    return (
                        <div key={q._id} className="glass-card" style={{ padding: '25px', borderLeft: `5px solid ${isCorrect ? 'var(--success)' : (isSkipped ? 'var(--text-muted)' : 'var(--error)')}` }}>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <span style={{
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    height: 'fit-content',
                                    fontWeight: 'bold',
                                    color: 'var(--text-muted)'
                                }}>
                                    Q{index + 1}
                                </span>
                                <h3 style={{ fontSize: '1.2rem', lineHeight: '1.4' }}>{q.questionText}</h3>
                            </div>

                            <div style={{ display: 'grid', gap: '10px', marginLeft: '50px' }}>
                                {q.options.map((option, optIndex) => {
                                    const isUserChoice = userSelected === option;
                                    const isCorrectChoice = q.correctAnswer === option;

                                    let bgColor = 'rgba(15, 23, 42, 0.3)';
                                    let borderColor = 'transparent';
                                    let icon = null;

                                    if (isUserChoice && isCorrectChoice) {
                                        bgColor = 'rgba(16, 185, 129, 0.2)'; // Success Green
                                        borderColor = 'var(--success)';
                                        icon = <CheckCircle size={18} color="var(--success)" />;
                                    } else if (isUserChoice && !isCorrectChoice) {
                                        bgColor = 'rgba(239, 68, 68, 0.2)'; // Error Red
                                        borderColor = 'var(--error)';
                                        icon = <XCircle size={18} color="var(--error)" />;
                                    } else if (isCorrectChoice) {
                                        bgColor = 'rgba(16, 185, 129, 0.1)'; // Hint Green
                                        borderColor = 'var(--success)';
                                        icon = <CheckCircle size={18} color="var(--success)" />;
                                    }

                                    return (
                                        <div key={optIndex} style={{
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            background: bgColor,
                                            border: `1px solid ${borderColor}`,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            opacity: (isUserChoice || isCorrectChoice) ? 1 : 0.6
                                        }}>
                                            <span>{option}</span>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </div>

                            {isSkipped && (
                                <div style={{ marginLeft: '50px', marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <HelpCircle size={16} /> You skipped this question.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewQuiz;
