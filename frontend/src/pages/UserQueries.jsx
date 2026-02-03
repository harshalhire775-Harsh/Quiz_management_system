import { useEffect, useState } from 'react';
import { Trash2, Search, Users, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const UserQueries = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const { data } = await API.get('/contact');
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this Message?')) {
            try {
                await API.delete(`/contact/${id}`);
                setMessages(messages.filter(msg => msg._id !== id));
            } catch (error) {
                alert('Failed to delete message');
            }
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/super-admin')}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Complaints</span>
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Manage incoming complaints and support requests</p>
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
                {/* Visual Header in Card */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 rounded-2xl bg-violet-100 text-violet-600">
                        <Users size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-800">Complaints Directory</h3>
                        <p className="text-slate-500">Total {filteredMessages.length} active complaints</p>
                    </div>
                    <div className="relative w-full md:w-auto min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium text-slate-700"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User Name</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Message</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 font-medium">
                                        Loading messages...
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={msg._id}
                                        className="hover:bg-slate-50 transition-colors group"
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap text-slate-500 font-medium">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                            <span className="block text-xs text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-blue-500/20 shadow-lg">
                                                    {msg.name.charAt(0)}
                                                </div>
                                                <div className="font-bold text-slate-700 text-md">{msg.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-blue-600 hover:underline cursor-pointer font-medium">
                                            <a href={`mailto:${msg.email}`}>{msg.email}</a>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-start gap-2 max-w-md">
                                                <MessageSquare size={16} className="text-slate-400 mt-1 shrink-0" />
                                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                            {filteredMessages.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-500 font-medium">
                                        No messages found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default UserQueries;
