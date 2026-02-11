import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, User, Phone, MapPin, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import logo from '../assets/logo.png';

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
            alert('Please accept the terms and conditions');
            return;
        }

        setLoading(true);
        try {
            // Mapping fields to backend user model
            const payload = {
                name: formData.adminName,
                email: formData.email,
                phoneNumber: formData.phone,
                role: 'Admin (HOD)',
                department: formData.collegeName, // Using department field to store college name
                bio: formData.address // Using bio field to store address
            };

            const { data } = await API.post('/auth/register', payload);

            if (data.success) {
                alert('Registration request sent successfully! The Super Admin will verify your details and email you once approved.');
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Registration failed. Please try again.');
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
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Phone</label>
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
                                <span className="text-sm font-medium text-slate-600">I accept the Institutional <span className="text-blue-600 underline">Terms & Conditions</span></span>
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
        </div>
    );
};

export default Register;
