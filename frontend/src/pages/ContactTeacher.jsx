import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageSquare, AlertCircle, CheckCircle, Mail, Trash2, User, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import { io } from 'socket.io-client';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const ContactTeacher = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Normal'
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await API.post('/contact', {
                name: user?.name,
                email: user?.email,
                subject: formData.subject || "Student Inquiry",
                priority: formData.priority,
                message: formData.message,
                senderRole: 'Student',
                year: user?.year
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
                        <h1 className="text-3xl font-black text-slate-800">Contact Teacher</h1>
                        <p className="text-slate-500 font-medium">Have a question? Send a message to your teachers.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        View Responses
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-xl text-sm font-bold flex-1">
                            <AlertCircle size={18} />
                            <span>Please allow up to 24 hours for a response.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={!formData.message.trim()}
                            className="py-4 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Send size={20} />
                            Send Message
                        </button>
                    </div>
                </form>
            </motion.div>

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
                                            setFormData({ subject: '', message: '', priority: 'Normal' });
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
