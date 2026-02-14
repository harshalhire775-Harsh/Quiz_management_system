import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, ShieldCheck, Mail, Key, Hash, Save, X, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

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
            showErrorAlert("Invalid Password", "Password must be at least 6 characters");
            return;
        }

        const isConfirmed = await showConfirmAlert(
            "Update Password?",
            "Are you sure you want to change the password for this HOD? The new password will be emailed to them."
        );

        if (!isConfirmed) return;

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
            showSuccessAlert("Password Updated!", "The new password has been set and emailed to the HOD.");

        } catch (error) {
            console.error("Update failed", error);
            showErrorAlert("Update Failed", "Failed to update the password. Please try again.");
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
        <div className="p-8 bg-slate-50 min-h-screen animate-fade-in relative font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Link to="/admin" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2 transition-colors font-bold text-sm">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Department Heads</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Oversee subject heads, manage credentials, and configure access.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Departments</span>
                            <span className="text-2xl font-black text-slate-800">{departments.length}</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by HOD name, subject, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 outline-none"
                        />
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-wider">HOD Details</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Credentials</th>
                                    <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDepts.map((dept) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={dept._id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
                                                    {(dept.hod?.name || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{dept.hod?.name || "Unassigned"}</div>
                                                    <div className="text-slate-500 text-xs font-bold flex items-center gap-1 mt-0.5">
                                                        <Mail size={12} />
                                                        {dept.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-black uppercase tracking-wider rounded-lg w-fit border border-violet-100">
                                                    <Hash size={12} />
                                                    {dept.name}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 pl-1">ID: {dept._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {editingId === dept._id ? (
                                                <div className="flex items-center gap-2 animate-fade-in-up">
                                                    <input
                                                        type="text"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New Pass"
                                                        className="w-40 px-4 py-2 bg-white border-2 border-blue-100 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdatePassword(dept._id)}
                                                        disabled={updating}
                                                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingId(null); setNewPassword(''); }}
                                                        className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => { setEditingId(dept._id); setNewPassword(dept.adminPassword || ''); }}
                                                    className="group/pass cursor-pointer flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm w-fit"
                                                >
                                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover/pass:bg-emerald-100 transition-colors">
                                                        <Key size={16} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">Password</span>
                                                        <span className="font-mono text-sm font-bold text-slate-700 group-hover/pass:text-emerald-600 transition-colors">
                                                            {dept.adminPassword ? '••••••••' : 'Not Set'}
                                                        </span>
                                                    </div>
                                                    <div className="opacity-0 group-hover/pass:opacity-100 transition-opacity text-slate-400">
                                                        <Edit2 size={14} />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {!editingId && (
                                                <button
                                                    onClick={() => { setEditingId(dept._id); setNewPassword(dept.adminPassword || ''); }}
                                                    className="px-4 py-2 bg-white border-2 border-slate-100 text-slate-600 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-bold shadow-sm hover:shadow-md active:scale-95"
                                                >
                                                    Change Pass
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredDepts.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <ShieldCheck size={48} className="mb-4 text-slate-200" />
                                                <p className="text-lg font-bold text-slate-500">No Department Heads found.</p>
                                                <p className="text-sm">Try adjusting your search terms.</p>
                                            </div>
                                        </td>
                                    </tr>
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
