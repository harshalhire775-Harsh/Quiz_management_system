import { useState, useEffect } from 'react';
import { Bell, Reply, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import { io } from 'socket.io-client';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import { useNavigate } from 'react-router-dom';

const StudentNotifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/contact');
            setNotifications(data);
            // Mark all as read locally and in backend
            data.forEach(msg => {
                if (!msg.isRead) {
                    API.put(`/contact/${msg._id}/read`).catch(err => console.error("Failed to mark read", err));
                }
            });
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (user?.email) {
            console.log('🔗 Connecting to Socket.io for Student Notifications...');
            const socket = io('http://127.0.0.1:5000', {
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('✅ Connected to socket server:', socket.id);
                // Join room with student's email
                socket.emit('join_room', user.email.trim().toLowerCase());
            });

            socket.on('new_message', (newMessage) => {
                console.log('📩 New notification received:', newMessage);
                // Strict check: only if recipient is ME
                if (newMessage.recipientEmail?.trim().toLowerCase() === user.email.trim().toLowerCase()) {
                    setNotifications(prev => [newMessage, ...prev]);
                }
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const handleDelete = async (id) => {
        const isConfirmed = await showConfirmAlert(
            'Delete Notification?',
            'Are you sure you want to delete this notification?'
        );

        if (isConfirmed) {
            try {
                await API.delete(`/contact/${id}`);
                setNotifications(prev => prev.filter(n => n._id !== id));
                showSuccessAlert('Deleted!', 'Notification removed.');
            } catch (error) {
                showErrorAlert('Error', 'Failed to delete notification.');
            }
        }
    };

    const handleReply = () => {
        // Reply to teacher -> Contact Teacher Page
        navigate('/contact-teacher');
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Bell size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800">My Inbox</h1>
                    <p className="text-slate-500 font-medium">Messages from your teachers.</p>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No New Notifications</h3>
                        <p className="text-slate-400 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((note) => (
                            <motion.div
                                key={note._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${note.priority === 'High' ? 'bg-rose-500' :
                                    note.priority === 'Low' ? 'bg-emerald-500' : 'bg-indigo-500'
                                    }`}></div>

                                <div className="flex flex-col md:flex-row gap-4 justify-between items-start pl-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600">
                                                Teacher Check-in
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">
                                                {new Date(note.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{note.subject}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{note.message}</p>

                                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-indigo-600">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">
                                                {note.name ? note.name.charAt(0) : 'T'}
                                            </div>
                                            <span>From Teacher: {note.name || 'Admin'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-start md:self-center">
                                        <button
                                            onClick={handleReply}
                                            className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                                            title="Reply"
                                        >
                                            <Reply size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note._id)}
                                            className="p-2 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default StudentNotifications;
