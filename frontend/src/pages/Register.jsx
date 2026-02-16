import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, User, Phone, MapPin, Check, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import logo from '../assets/logo.png';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        collegeName: '',
        email: '',
        adminName: '',
        phone: '',
        address: '',

        agreed: false
    });
    const [loading, setLoading] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreed) {
            showErrorAlert('Terms Not Accepted', 'Please accept the terms and conditions to proceed.');
            return;
        }

        const isConfirmed = await showConfirmAlert('Submit Application?', 'Are you sure you want to send the form for verification?');
        if (!isConfirmed) return;

        setLoading(true);
        try {
            // Mapping fields to backend user model
            const payload = {
                name: formData.adminName,
                email: formData.email,
                phoneNumber: formData.phone,
                role: 'Admin (HOD)',
                department: formData.collegeName, // Using department field to store college name
                bio: formData.address, // Using bio field to store address

            };

            const { data } = await API.post('/auth/register', payload);

            if (data.success) {
                await showSuccessAlert('Application Sent Successfully!', 'Your application has been sent. The Super Admin will verify your details and email you once approved.');
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
            showErrorAlert('Registration Failed', error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white max-w-4xl w-full rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Visual Side (Optional, or just form) - Screenshot shows just form, I'll keep it centered/clean */}

                <div className="flex-1 p-8 md:p-12">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                            <div className="w-12 h-12 p-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-blue-500/10">
                                <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Institutional Registration</h1>
                        <p className="text-slate-500 mt-2">Register your college/university to manage assessments.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 01. College Information */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">01</span>
                                College Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">College Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="collegeName"
                                            value={formData.collegeName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                                            placeholder="Full College Name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Official Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                                            placeholder="admin@college.edu"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Admin Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="adminName"
                                            value={formData.adminName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                                            placeholder="Principal Name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
                                            placeholder="10-digit mobile"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Campus Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 resize-none"
                                            placeholder="Complete institutional address..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                                    {formData.agreed && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    checked={formData.agreed}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <span className="text-sm font-medium text-slate-600">
                                    I accept the Institutional
                                    <span
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowTerms(true);
                                        }}
                                        className="text-blue-600 underline ml-1 cursor-pointer hover:text-blue-800"
                                    >
                                        Terms & Conditions
                                    </span>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading || !formData.agreed}
                                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Request Verification'}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Terms & Conditions Modal */}
            {showTerms && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Terms & Conditions</h3>
                            <button
                                onClick={() => setShowTerms(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 space-y-6 bg-slate-50 text-slate-700">
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-black text-xl text-slate-800 mb-2">1. Acceptance of Terms</h4>
                                <p className="text-sm leading-relaxed">
                                    By accessing or using the Quiz Management System (the "Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-black text-xl text-slate-800 mb-2">2. Use License</h4>
                                <p className="text-sm leading-relaxed">
                                    Permission is granted to temporarily use the materials (information or software) on the Quiz Management System website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-black text-xl text-slate-800 mb-2">3. User Accounts</h4>
                                <p className="text-sm leading-relaxed">
                                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-black text-xl text-slate-800 mb-2">4. Content</h4>
                                <p className="text-sm leading-relaxed">
                                    Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                            <button
                                onClick={() => setShowTerms(false)}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Register;
