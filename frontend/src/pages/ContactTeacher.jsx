import { useState, useEffect } from 'react';
import { Send, MessageSquare, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import { io } from 'socket.io-client';

const ContactTeacher = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('inbox');

    // Inbox State
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Send Form State
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Normal'
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const { data } = await API.get('/contact');
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Fetch Messages & Socket Setup
    useEffect(() => {
        fetchMessages();

        if (user?.email) {
            const socket = io('http://localhost:5000');

            // Student joins their private room
            socket.emit('join_room', user.email);

            socket.on('new_message', (newMessage) => {
                // Students see messages sent TO them
                if (newMessage.recipientEmail === user.email) {
                    setMessages(prev => [newMessage, ...prev]);
                }
            });

            return () => socket.disconnect();
        }
    }, [user?.email]);

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await API.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m._id !== id));
        } catch (error) {
            alert('Failed to delete message');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await API.post('/contact', {
                name: user?.name,
                email: user?.email,
                subject: formData.subject,
                priority: formData.priority,
                message: formData.message,
                senderRole: 'Student'
                // No recipientEmail implies it goes to 'Admin' or default teacher pool
            });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            setFormData({ subject: '', message: '', priority: 'Normal' });
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Messages</h1>
                        <p className="text-slate-500 font-medium">Communicate with your teachers.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'inbox'
                            ? 'bg-white text-slate-800 shadow-md transform scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Mail size={16} /> Inbox
                    </button>
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'compose'
                            ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]'
                            : 'text-slate-500 hover:text-indigo-600'
                            }`}
                    >
                        <Send size={16} /> Contact Teacher
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'inbox' ? (
                    <motion.div
                        key="inbox"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {loadingMessages ? (
                            <div className="text-center py-12 bg-white rounded-[2rem]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-slate-400 font-medium">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 border-dashed">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No Messages Yet</h3>
                                <p className="text-slate-400 font-medium mt-1">Messages from your teachers will appear here.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${msg.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                                msg.priority === 'Low' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                {msg.senderRole === 'Sir' ? 'T' : 'A'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{msg.subject || 'No Subject'}</h3>
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                    From: {msg.name} • <span className="opacity-70">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed pl-[3.25rem]">
                                        {msg.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="compose"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }} className="space-y-6">
                            <div>
                                <label className="block text-slate-700 font-bold mb-2 ml-1">Message</label>
                                <textarea
                                    required
                                    rows="8"
                                    placeholder="Describe your issue or question in detail..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-xl text-sm font-bold">
                                <AlertCircle size={18} />
                                <span>Please allow up to 24 hours for a response.</span>
                            </div>

                            <button
                                type="submit"
                                disabled={!formData.message.trim()}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={20} />
                                Send Message
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation & Success Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
                        >
                            {submitted ? (
                                <div className="text-center py-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        type="spring"
                                        className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                                    >
                                        <CheckCircle size={40} />
                                    </motion.div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">Success!</h3>
                                    <p className="text-slate-500 font-medium mb-8">Your message has been sent successfully.</p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setShowModal(false);
                                            setFormData({ message: '' });
                                            setActiveTab('inbox');
                                        }}
                                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Send size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-2">Send Message?</h3>
                                        <p className="text-slate-500">Are you sure you want to send this message to the teacher?</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={sending}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            {sending ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : (
                                                'Confirm Send'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactTeacher;
