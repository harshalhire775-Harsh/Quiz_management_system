import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Shield, Compass, Medal, Star,
    Zap, Camera, Save, X, Settings, Key, FileText,
    Layout, CheckCircle, AlertCircle, TrendingUp, Flame, Share2, Shuffle
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import useAuth from '../hooks/useAuth';
import API from '../api/axios';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showFullView, setShowFullView] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);
    const [notification, setNotification] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '', bio: '', year: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                bio: user.bio || '',
                year: user.year || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setIsEditing(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRandomAvatar = () => {
        // Generate a random seed
        const seed = Math.random().toString(36).substring(7);
        // Use DiceBear API for a high-quality avatar
        const randomUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        setPreviewImage(randomUrl);
        setIsEditing(true);
    };

    const compressImage = async (base64) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;
            // Enable CORS for external images if we were to draw them, but we'll skip drawing for URLs in handleUpdateProfile
            img.crossOrigin = "Anonymous";
            img.onerror = () => resolve(base64);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; const MAX_HEIGHT = 400;
                let width = img.width; let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // If the image is tainted (cross-origin), toDataURL might fail. 
                // In that case, we should probably just return the original URL/base64?
                // But for safety in this function, we assume success or catch block.
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                } catch (e) {
                    // Fallback to original if we can't compress (e.g. tainted canvas)
                    resolve(base64);
                }
            };
        });
    };

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setUploading(true);
        try {
            let updatePayload = { ...formData };
            if (previewImage) {
                // improved: only compress if it's a data URL (local upload)
                if (previewImage.startsWith('data:')) {
                    updatePayload.profileImage = await compressImage(previewImage);
                } else {
                    // It's a remote URL (like the random avatar), save as is
                    updatePayload.profileImage = previewImage;
                }
            }
            const { data } = await API.put('/auth/profile', updatePayload);
            updateUser(data);
            setIsEditing(false);
            setPreviewImage(null);

            setNotification({ type: 'success', message: 'Profile updated successfully! ✨' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: error.response?.data?.message || 'Update failed.' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setUploading(false);
        }
    };



    const shareProfile = () => {
        const text = `Check out my progress on QuizPro! 🚀 I'm learning and growing every day. Join me: ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (!user) return <div className="container">Loading...</div>;

    const chartData = user.scoresHistory?.map((item, index) => ({
        name: `Quiz ${index + 1}`,
        score: Math.round(item.score),
        date: new Date(item.date).toLocaleDateString()
    })) || [];

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 20px', minHeight: '80vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ position: 'relative' }}>
                            <div
                                style={{
                                    width: '140px', height: '140px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    padding: '4px', overflow: 'hidden', cursor: 'pointer',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)', border: '2px solid var(--glass-border)'
                                }}
                                onDoubleClick={() => setShowFullView(true)}
                            >
                                <img
                                    src={previewImage || user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            </div>
                            {/* Upload Button */}
                            <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--primary)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 10 }}>
                                <Camera size={20} />
                            </button>
                            {/* Random Avatar Button */}
                            <button
                                onClick={handleRandomAvatar}
                                title="Generate Random Avatar"
                                style={{ position: 'absolute', bottom: '8px', right: '55px', background: 'var(--secondary)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 10 }}
                            >
                                <Shuffle size={20} />
                            </button>
                            <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>{user.name}</h1>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <Mail size={16} /> {user.email}
                                </span>
                                {user.streak?.current > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#f59e0b', fontWeight: '700' }}>
                                        <Flame size={18} fill="#f59e0b" /> {user.streak.current} Day Streak!
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                {user.isAdmin && (
                                    <span style={{ padding: '6px 16px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '25px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', background: 'var(--card-bg)', padding: '6px', borderRadius: '18px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <button onClick={() => setActiveTab('overview')} style={{ padding: '12px 24px', borderRadius: '12px', background: activeTab === 'overview' ? 'var(--primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', transition: '0.3s', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}><Layout size={20} /> Overview</button>
                        <button onClick={() => setActiveTab('analytics')} style={{ padding: '12px 24px', borderRadius: '12px', background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', transition: '0.3s', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp size={20} /> Analytics</button>
                        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px 24px', borderRadius: '12px', background: activeTab === 'settings' ? 'var(--primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', transition: '0.3s', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={20} /> Settings</button>
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                            <div className="glass-card" style={{ padding: '35px' }}>
                                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}><FileText size={22} color="var(--primary)" /> Profile Bio</h3>
                                <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{user.bio || "Crafting your journey... add a bio in settings to inspire others!"}</p>

                                <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp size={18} /> Recent Activity</h4>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {user.scoresHistory?.slice(-3).reverse().map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                <span style={{ fontWeight: '600' }}>Quiz Attempt #{user.scoresHistory.length - i}</span>
                                                <span style={{ color: item.score >= 50 ? 'var(--success)' : 'var(--error)', fontWeight: '800' }}>{Math.round(item.score)}%</span>
                                            </div>
                                        )) || <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No quizzes attempted yet.</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '35px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}><Medal size={22} color="var(--accent)" /> Achievements</h3>
                                    <button onClick={shareProfile} style={{ background: '#22c55e15', color: '#22c55e', border: '1px solid #22c55e30', padding: '6px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Share2 size={14} /> Share Profile
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    {[
                                        { icon: <Star />, color: '#6366f1', label: 'Quiz Pro', desc: 'Completed 5+ quizzes' },
                                        { icon: <Compass />, color: '#ec4899', label: 'Explorer', desc: 'Tried 3 categories' },
                                        { icon: <Zap />, color: '#f59e0b', label: 'Fast Finger', desc: '100% score once' }
                                    ].map((badge, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ y: -5, scale: 1.05 }}
                                            style={{
                                                flex: '1', minWidth: '80px', background: `${badge.color}10`,
                                                borderRadius: '20px', padding: '20px 10px', textAlign: 'center',
                                                border: `1px solid ${badge.color}20`, position: 'relative'
                                            }}
                                        >
                                            <div style={{ color: badge.color, marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                                                {badge.icon}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '800', marginBottom: '4px' }}>{badge.label}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{badge.desc}</div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Level 1: Novice</span>
                                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Next: Level 2</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: '45%', height: '100%', background: 'var(--primary)' }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}><TrendingUp color="var(--primary)" /> Performance Journey</h3>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{chartData.length > 0 ? `${Math.round(chartData.reduce((a, b) => a + b.score, 0) / chartData.length)}%` : '0%'}</span>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Score</div>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: 350 }}>
                                {chartData.length > 1 ? (
                                    <ResponsiveContainer>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                                                itemStyle={{ color: 'var(--primary)' }}
                                            />
                                            <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', borderRadius: '20px' }}>
                                        <AlertCircle size={40} color="var(--text-muted)" />
                                        <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Complete at least 2 quizzes to see your journey!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card" style={{ padding: '40px' }}>
                            <h3 style={{ marginBottom: '35px' }}>Customization</h3>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                <div className="form-group"><label>Display Name</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} /></div>
                                <div className="form-group"><label>Phone Number</label><input type="text" name="phoneNumber" className="form-control" value={formData.phoneNumber} onChange={handleInputChange} /></div>

                                {user.role === 'Student' && (
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Academic Year</label>
                                        <select
                                            name="year"
                                            className="form-control"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="FY">First Year (FY)</option>
                                            <option value="SY">Second Year (SY)</option>
                                            <option value="TY">Third Year (TY)</option>
                                        </select>
                                    </div>
                                )}
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Professional Bio</label>
                                    <textarea name="bio" className="form-control" rows="4" value={formData.bio} onChange={handleInputChange} style={{ resize: 'none' }} placeholder="Aspiring developer, quiz master, and lifelong learner..."></textarea>
                                </div>
                                <button type="submit" disabled={uploading} className="btn btn-primary" style={{ gridColumn: 'span 2', padding: '14px' }}>
                                    {uploading ? 'Updating Server...' : 'Save Profile Changes'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, x: '-50%' }}
                            animate={{ opacity: 1, y: 20, x: '-50%' }}
                            exit={{ opacity: 0, y: -50, x: '-50%' }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: '50%',
                                background: notification.type === 'success' ? '#22c55e' : '#ef4444',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                zIndex: 10000,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: '600'
                            }}
                        >
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Full View Modal */}
            <AnimatePresence>
                {showFullView && (user.profileImage || previewImage) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(20px)' }} onClick={() => setShowFullView(false)}>
                        <motion.div
                            initial={{ y: 200, scale: 0.5, rotate: -5, opacity: 0 }}
                            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ y: 200, scale: 0.5, rotate: 5, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                            style={{ position: 'relative' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={previewImage || user.profileImage} alt="Full" style={{ maxWidth: '85vw', maxHeight: '80vh', borderRadius: '30px', border: '5px solid white', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }} />
                            <button onClick={() => setShowFullView(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={26} /></button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .form-control { background: rgba(15, 23, 42, 0.4); border: 1px solid var(--glass-border); color: white; padding: 14px 18px; borderRadius: 12px; outline: none; transition: 0.3s; width: 100%; border-sizing: border-box; }
                .form-control:focus { border-color: var(--primary); box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
                .form-group label { display: block; margin-bottom: 10px; font-weight: 600; font-size: 0.95rem; color: var(--text-main); }
            `}</style>
        </div>
    );
};

export default Profile;
