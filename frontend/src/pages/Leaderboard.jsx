import { useState, useEffect } from 'react';
import { Trophy, Medal, Users, Star } from 'lucide-react';
import API from '../api/axios';

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await API.get('/results/leaderboard');
                setData(data);
            } catch (error) {
                console.error('Leaderboard error', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}><h1>Loading Rankings...</h1></div>;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>
                    Global <span style={{ color: 'var(--primary)' }}>Leaderboard</span>
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>The top performers across all quizzes on the platform.</p>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {data.map((user, index) => (
                    <div key={user._id} className="glass-card" style={{
                        padding: '20px 40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: index === 0 ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                        background: index === 0 ? 'rgba(34, 211, 238, 0.05)' : 'var(--card-bg)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                width: '40px',
                                color: index < 3 ? 'var(--accent)' : 'var(--text-muted)'
                            }}>
                                #{index + 1}
                            </div>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'rgba(99, 102, 241, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {index === 0 ? <Trophy size={24} color="gold" /> : <Users size={24} />}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{user.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.totalAttempts} Quizzes Attempted</div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', gap: '40px' }}>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{user.totalScore}</div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Score</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>{user.avgPercentage}%</div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Avg Accuracy</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
