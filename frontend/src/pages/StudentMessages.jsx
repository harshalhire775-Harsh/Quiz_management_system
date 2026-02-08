import { useEffect, useState } from 'react';
import {
    Trash2, Search, MessageSquare, User, Clock, AlertCircle,
    Building2, GraduationCap, Hash, Send, ChevronRight, CheckCircle, Reply
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentMessages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Compose State
    const [composeLoading, setComposeLoading] = useState(false);
    const [years] = useState(['FY', 'SY', 'TY']);
    const [selectedYear, setSelectedYear] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentMessage, setStudentMessage] = useState('');
    const [subject, setSubject] = useState('Message from Teacher');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Handle Reply Context
    useEffect(() => {
        if (location.state?.replyTo) {
            const replyUser = location.state.replyTo;
            // Pre-fill if we have the data
            if (replyUser.year) setSelectedYear(replyUser.year);
            if (replyUser._id) {
                // We need to wait for students to load to select the ID properly in the dropdown,
                // or we just rely on the effect below.
                // However, 'students' list depends on selectedYear.
                // So setting selectedYear will trigger the fetch.
                // We need to set selectedStudent AFTER the fetch.
                // This is a bit tricky with simple useEffects. 
                // Let's just set the ID and hope the list populates.
                // Actually, let's just use a separate effect for the selection.
            }
            setSubject(`Re: ${subject}`);
        }
    }, [location.state]);

    // Fetch Students when Year is selected
    useEffect(() => {
        if (selectedYear) {
            const fetchStudents = async () => {
                try {
                    const { data } = await API.get(`/users/students-by-year?year=${selectedYear}`);
                    setStudents(data);

                    // If we have a reply context, select the student now that list is loaded
                    if (location.state?.replyTo?._id) {
                        const exists = data.find(s => s._id === location.state.replyTo._id);
                        if (exists) {
                            setSelectedStudent(exists._id);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch students", error);
                }
            };
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedYear, location.state]);

    const handleSendMessage = async () => {
        setComposeLoading(true);

        const student = students.find(s => s._id === selectedStudent);
        if (!student) return;

        try {
            await API.post('/contact', {
                name: user?.name || "Teacher",
                email: user?.email || "teacher@system.com",
                subject: subject,
                message: studentMessage,
                priority: 'Normal',
                recipientEmail: student.email,
                senderRole: 'Sir'
            });

            setSubmitted(true);
        } catch (error) {
            console.error("Failed to send", error);
            alert("Failed to send message.");
            setShowModal(false);
        } finally {
            setComposeLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Contact Student</h1>
                    <p className="text-slate-500 font-medium">Send messages to students.</p>
                </div>
                <button
                    onClick={() => navigate('/notifications')}
                    className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <MessageSquare size={18} /> View Responses
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-indigo-500/5 mt-8"
            >
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Send className="text-indigo-600" /> Send Message
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }} className="space-y-6">
                    {/* Year Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        {years.map(year => (
                            <button
                                key={year}
                                type="button"
                                onClick={() => { setSelectedYear(year); setSelectedStudent(''); }}
                                className={`py-3 rounded-xl font-bold border-2 transition-all ${selectedYear === year
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-indigo-200'
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    {/* Student Selection (Conditional) */}
                    <AnimatePresence>
                        {selectedYear && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Student</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={selectedStudent}
                                            onChange={(e) => setSelectedStudent(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium outline-none text-slate-700 appearance-none"
                                        >
                                            <option value="">Choose a student...</option>
                                            {students.map(s => (
                                                <option key={s._id} value={s._id}>
                                                    {s.name} ({s.rollNumber || 'No Roll'})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight className="rotate-90" size={20} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>



                    {/* Message Area */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                        <textarea
                            required
                            value={studentMessage}
                            onChange={(e) => setStudentMessage(e.target.value)}
                            placeholder="Write your message here..."
                            rows={5}
                            className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium outline-none text-slate-700 resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={composeLoading || !selectedStudent || !studentMessage}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Send size={20} /> Send Message
                    </button>
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
                                    <p className="text-slate-500 font-medium mb-8">Message sent successfully.</p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setShowModal(false);
                                            setStudentMessage('');
                                            setSelectedStudent('');
                                            // Optional: Go to notifications or stay
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
                                        <p className="text-slate-500">Are you sure you want to send this message?</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={composeLoading}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            {composeLoading ? (
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

export default StudentMessages;
