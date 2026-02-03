import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Search, UserCheck, ShieldCheck, ArrowLeft, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ManageHODs = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get('/users/admins');
            // Ensure data has isBlocked field, if not assume false
            setAdmins(data);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this HOD?')) {
            try {
                await API.delete(`/auth/users/${id}`); // Correct path based on authRoutes.js
                setAdmins(admins.filter(admin => admin._id !== id));
            } catch (error) {
                alert('Failed to delete admin');
            }
        }
    };

    const handleBlockToggle = async (admin) => {
        const action = admin.isBlocked ? 'unblock' : 'block';
        if (window.confirm(`Are you sure you want to ${action} ${admin.name}?`)) {
            try {
                await API.put(`/users/${admin._id}/${action}`);
                fetchAdmins(); // Refresh to ensure state sync
            } catch (error) {
                console.error(error);
                alert(`Failed to ${action} user`);
            }
        }
    };

    const filteredAdmins = admins.filter(admin =>
        (admin.role === 'Admin (HOD)') &&
        (admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Department Heads</span>
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">View and manage department administrators</p>
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
                        <ShieldCheck size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-800">HOD Directory</h3>
                        <p className="text-slate-500">Total {filteredAdmins.length} active heads</p>
                    </div>
                    <div className="relative w-full md:w-auto min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
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
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">HOD Name</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAdmins.map((admin) => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={admin._id}
                                    className="hover:bg-slate-50 transition-colors group"
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-blue-500/20 shadow-lg">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div className="font-bold text-slate-700 text-lg">{admin.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-slate-500 font-medium">{admin.email}</td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold w-fit border border-violet-100">
                                            <ShieldCheck size={14} />
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 w-fit ${admin.isBlocked ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            <span className={`w-2 h-2 rounded-full ${admin.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                            {admin.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleBlockToggle(admin)}
                                                className={`p-2.5 rounded-xl transition-all ${admin.isBlocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                                title={admin.isBlocked ? "Unblock HOD" : "Block HOD"}
                                            >
                                                <UserCheck size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin._id)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete HOD"
                                            >
                                                <Trash2 size={20} />
                                            </button>

                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredAdmins.length === 0 && !loading && (
                                <tr>
                                    <td colspan="5" className="px-8 py-12 text-center text-slate-500 font-medium">
                                        No HODs found.
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

export default ManageHODs;
