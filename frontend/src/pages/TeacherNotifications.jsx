import { useState, useEffect } from 'react';
import { Bell, Reply, Trash2, User, Mail, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const TeacherNotifications = () => {
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
            console.log('🔗 Connecting to Socket.io for Teacher Notifications...');
            const socket = io(`http://${window.location.hostname}:5000`, {
                transports: ['websocket', 'polling']
            });

            socket.on('connect', () => {
                console.log('✅ Connected to socket server:', socket.id);
                // Join basic rooms
                socket.emit('join_room', 'admin_room');

                // Join personal email room for direct messages
                if (user.email) {
                    socket.emit('join_room', user.email.trim().toLowerCase());
                }

                // Join college room for general inquiries
                if (user.collegeId) {
                    socket.emit('join_room', `college_${user.collegeId}`);
                }
            });

            socket.on('new_message', (newMessage) => {
                console.log('📩 New inquiry received:', newMessage);

                const myEmail = user.email.trim().toLowerCase();
                const msgRecipient = newMessage.recipientEmail ? newMessage.recipientEmail.trim().toLowerCase() : null;

                // Condition to show: Direct Message to ME OR General Message (no recipient)
                const isDirectMessageForMe = msgRecipient === myEmail;
                const isGeneralMessage = !msgRecipient;

                if (isDirectMessageForMe || isGeneralMessage) {
                    setNotifications(prev => [newMessage, ...prev]);
                }
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const handleDelete = async (id) => {
        // Fancy Delete Confirmation
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: '#1a1c23', // Dark background
            color: '#fff', // White text
            showClass: {
                popup: `
                  animate__animated
                  animate__fadeInDown
                  animate__faster
                `
            },
            hideClass: {
                popup: `
                  animate__animated
                  animate__fadeOutUp
                  animate__faster
                `
            }
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`/contact/${id}`);
                setNotifications(prev => prev.filter(n => n._id !== id));

                // Success Popup with Animation
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Message has been deleted.',
                    icon: 'success',
                    background: '#1a1c23',
                    color: '#fff',
                    confirmButtonColor: '#f59e0b',
                    showClass: {
                        popup: `
                          animate__animated
                          animate__tada
                          animate__faster
                        `
                    }
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete message.',
                    icon: 'error',
                    background: '#1a1c23',
                    color: '#fff'
                });
            }
        }
    };

    const handleReply = (msg) => {
        // Teacher replying to student -> Navigate to Contact Student with reply context
        if (msg.user) {
            navigate('/teacher/contact-student', { state: { replyTo: msg.user } });
        } else {
            // Fallback if user object is missing but we have email
            // We might need to handle this closer to how StudentMessages expects context
            // For now, assume most inquiries have a user attached via backend populate
            navigate('/teacher/contact-student', { state: { replyTo: { email: msg.email, name: msg.name } } });
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Bell size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Student Inquiries</h1>
                    <p className="text-slate-500 font-medium">Messages and questions from students.</p>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading inquiries...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No New Inquiries</h3>
                        <p className="text-slate-400 mt-1">Check back later!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((note) => (
                            <motion.div
                                key={note._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 flex items-center gap-1">
                                                <User size={12} /> Student Inquiry
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">
                                                {new Date(note.createdAt).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1 mb-3">
                                            <h3 className="text-xl font-bold text-slate-800 leading-tight">{note.subject || 'Student Inquiry'}</h3>
                                            <div className="flex flex-wrap gap-3 mt-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100">
                                                    <User size={14} />
                                                    <span className="opacity-70 mr-1">Student Name:</span> {note.name || note.user?.name}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">{note.message}</p>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-start md:self-center">
                                        <button
                                            onClick={() => handleReply(note)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm flex items-center gap-2 shadow-sm"
                                        >
                                            <Reply size={16} /> Reply
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note._id)}
                                            className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all"
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

export default TeacherNotifications;
