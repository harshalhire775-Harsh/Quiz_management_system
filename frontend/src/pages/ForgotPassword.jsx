import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import logo from '../assets/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setSuccess(true);
            // Navigate to reset password page after short delay or let user click link in email (which we are mocking as OTP)
            // For now, we stay here or redirect to ResetPassword page to enter OTP
            setTimeout(() => {
                navigate('/reset-password');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-xl"
            >
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-blue-500/10 flex items-center justify-center overflow-hidden w-20 h-20">
                                <img src={logo} alt="QuizPro" className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Forgot Password?</h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Enter your email to receive a reset OTP.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-3 mb-6 font-medium"
                        >
                            <AlertCircle size={18} className="text-red-500" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl flex items-center gap-3 mb-6 font-medium"
                        >
                            <CheckCircle size={18} className="text-green-500" />
                            <span>OTP sent to your email! Redirecting...</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all flex justify-center items-center gap-2 mt-2"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
