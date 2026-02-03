import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, ShieldCheck, Mail, Key, Hash, Save, X, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const ManageDepartmentHODs = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Password State
    const [editingId, setEditingId] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/departments');
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (subDeptId) => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        setUpdating(true);
        try {
            await API.put(`/departments/${subDeptId}`, {
                adminPassword: newPassword
            });

            // Update local state
            setDepartments(departments.map(d =>
                d._id === subDeptId ? { ...d, adminPassword: newPassword } : d
            ));

            setEditingId(null);
            setNewPassword('');
            alert("Password updated successfully");
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update password");
        } finally {
            setUpdating(false);
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.hod?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <Link to="/admin" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2 transition-colors">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </Link>
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <ShieldCheck size={32} className="text-blue-600" /> Manage HODs
                        </h2>
                        <p className="text-slate-500 mt-1">Manage Subject Heads, credentials and access.</p>
                    </div>

                    <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm w-full md:w-auto min-w-[300px]">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search HODs, Subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">HOD Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject (Dept)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Credentials</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDepts.map((dept) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={dept._id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                                                    {(dept.hod?.name || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{dept.hod?.name || "Unassigned"}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{dept.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                                                {dept.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium font-mono text-xs">
                                                <Hash size={14} className="text-slate-400" />
                                                {dept._id.substring(dept._id.length - 6).toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === dept._id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New Pass"
                                                        className="w-32 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group/pass cursor-pointer">
                                                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                                                        <Key size={14} />
                                                    </div>
                                                    <span className="font-mono text-sm font-bold text-slate-600 group-hover/pass:text-emerald-700 transition-colors">
                                                        {dept.adminPassword || '••••••'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === dept._id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdatePassword(dept._id)}
                                                        disabled={updating}
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingId(null); setNewPassword(''); }}
                                                        className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setEditingId(dept._id); setNewPassword(dept.adminPassword || ''); }}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-blue-600 hover:border-blue-200 transition-all text-xs font-bold shadow-sm"
                                                >
                                                    <Edit2 size={14} /> Change Pass
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredDepts.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-8 text-slate-400">No HODs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageDepartmentHODs;
