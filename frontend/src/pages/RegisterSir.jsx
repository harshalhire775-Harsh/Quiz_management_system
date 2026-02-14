import { useState } from 'react';
import { UserPlus, Mail, Lock, Book, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const RegisterSir = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const filterDept = location.state?.filterDept;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        subject: '',
        department: filterDept || ''
    });
    const [inputSubject, setInputSubject] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRemoveSubject = (subToRemove) => {
        const current = formData.subject ? formData.subject.split(',') : [];
        const updated = current.filter(s => s !== subToRemove);
        setFormData({ ...formData, subject: updated.join(',') });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Include any pending text in inputSubject
        let finalSubject = formData.subject;
        if (inputSubject.trim()) {
            const current = formData.subject ? formData.subject.split(',') : [];
            if (!current.includes(inputSubject.trim())) {
                finalSubject = [...current, inputSubject.trim()].join(',');
            }
        }

        try {
            await API.post('/users/sirs', {
                ...formData,
                subject: finalSubject,
                department: filterDept || formData.department || ''
            });
            showSuccessAlert('Success!', 'Teacher Added Successfully! 🎓');
            navigate('/admin/manage-sirs');
        } catch (error) {
            showErrorAlert('Registration Failed', error.response?.data?.message || 'Failed to register teacher');
        } finally {
            setLoading(false);
        }
    };

    const subjectsList = formData.subject ? formData.subject.split(',') : [];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100 text-violet-600 mb-4">
                        <UserPlus size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Add New Teacher</h1>
                    <p className="text-slate-500 mt-2">Create an account for a new faculty member</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                placeholder="Enter full name"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                placeholder="name@college.edu"
                            />
                        </div>
                    </div>

                    {/* Subject Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subject Specialization</label>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all bg-white relative">
                            {subjectsList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {subjectsList.map((sub, idx) => (
                                        <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-bold">
                                            {sub}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSubject(sub)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Book className="text-slate-400 ml-1 shrink-0" size={20} />
                                <input
                                    type="text"
                                    value={inputSubject}
                                    onChange={(e) => setInputSubject(e.target.value)}
                                    placeholder={subjectsList.length === 0 ? "Type subject & press Enter" : "Add another..."}
                                    className="w-full bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = inputSubject.trim();
                                            if (val) {
                                                const current = formData.subject ? formData.subject.split(',') : [];
                                                if (!current.includes(val)) {
                                                    setFormData({ ...formData, subject: [...current, val].join(',') });
                                                }
                                                setInputSubject('');
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium ml-1">
                            Press Enter to add a subject
                        </p>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Set Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input
                                type="text"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                placeholder="Create a strong password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Create Teacher Account'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/manage-sirs')}
                        className="w-full text-slate-500 py-2 font-bold hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default RegisterSir;
