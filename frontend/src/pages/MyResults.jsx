import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Calendar, Award, Eye } from 'lucide-react';
import API from '../api/axios';

const MyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await API.get('/results/myresults');
                setResults(data);
            } catch (error) {
                console.error('Failed to fetch results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Loading History...</h1></div>;

    return (
        <div className="container animate-fade-in">
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>My Quiz History</h2>
                <p style={{ color: 'var(--text-muted)' }}>Review your past performances and achievements.</p>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {results.length === 0 ? (
                    <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
                        <History size={60} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                        <h3>No quizzes taken yet</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Start your first quiz to see your results here.</p>
                    </div>
                ) : (
                    results.map((result) => (
                        <div key={result._id} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '15px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    <Award size={30} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{result.quiz?.title}</h4>
                                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Calendar size={14} /> {new Date(result.createdAt).toLocaleDateString()}
                                        </span>
                                        <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{result.quiz?.category}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: (result.score / result.totalQuestions) >= 0.5 ? 'var(--success)' : 'var(--error)' }}>
                                    {result.score} / {result.totalQuestions}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Score</div>
                                <Link to={`/review/${result._id}`} className="btn btn-secondary" style={{ padding: '5px 15px', fontSize: '0.8rem' }}>
                                    <Eye size={14} /> Review
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyResults;
