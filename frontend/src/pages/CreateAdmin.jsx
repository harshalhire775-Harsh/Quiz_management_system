import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';

const CreateAdmin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/users/admins', formData);
            alert('Admin (HOD) created successfully!');
            navigate('/super-admin/manage-admins');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden"
            >
                <div className="p-8">
                    <button
                        onClick={() => navigate('/super-admin/manage-admins')}
                        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-bold text-sm">Back to List</span>
                    </button>

                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">New Department Head</h1>
                        <p className="text-slate-500 font-medium">Create a new Admin (HOD)</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                    placeholder="Contact number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block mb-2">Set Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none font-medium"
                                    placeholder="Strong password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-2 mt-6"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Create Admin</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateAdmin;
