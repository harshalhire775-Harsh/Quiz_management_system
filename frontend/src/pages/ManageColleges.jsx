import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Trash2, Search, ArrowLeft, Mail, Lock, UserCog, ShieldCheck, AlertCircle, CheckCircle, X, Key, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const ManageColleges = () => {
    // Super Admin View Only
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // College Form State
    const [newDept, setNewDept] = useState({ name: '', hodName: '', hodEmail: '', hodPassword: '', confirmPassword: '', collegeId: '' });

    // HOD Table State
    const [hods, setHods] = useState([]);
    const [hodSearch, setHodSearch] = useState('');

    useEffect(() => {
        fetchDepartments();
        fetchHods();
    }, []);

    const fetchHods = async () => {
        try {
            const { data } = await API.get('/users/admins');
            setHods(data.filter(u => u.role === 'Admin (HOD)'));
        } catch (error) {
            console.error("Failed to fetch HODs", error);
        }
    };

    const handleDeleteHod = async (id) => {
        const isConfirmed = await showConfirmAlert('Delete HOD?', 'Are you sure you want to delete this HOD?');
        if (isConfirmed) {
            try {
                await API.delete(`/auth/users/${id}`);
                setHods(hods.filter(h => h._id !== id));
                fetchDepartments();
                showSuccessAlert('Deleted!', 'HOD has been deleted.');
            } catch (error) {
                showErrorAlert('Error', 'Failed to delete HOD');
            }
        }
    };

    const handleBlockHod = async (hod) => {
        const action = hod.isBlocked ? 'unblock' : 'block';
        const isConfirmed = await showConfirmAlert(
            `${action === 'block' ? 'Block' : 'Unblock'} HOD?`,
            `Are you sure you want to ${action} ${hod.name}?`
        );
        if (isConfirmed) {
            try {
                await API.put(`/users/${hod._id}/${action}`);
                showSuccessAlert('Success!', `HOD has been ${action}ed.`);
                fetchHods();
            } catch (error) {
                showErrorAlert('Error', `Failed to ${action} user`);
            }
        }
    };

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

    const openCreateModal = () => {
        setNewDept({
            name: '',
            hodName: '',
            hodEmail: '',
            collegeId: '',
            hodPassword: '',
            confirmPassword: ''
        });
        setIsModalOpen(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (newDept.hodPassword !== newDept.confirmPassword) {
            showErrorAlert('Error', 'Passwords do not match!');
            return;
        }

        try {
            const payload = {
                name: newDept.name,
                hodName: newDept.hodName,
                hodEmail: newDept.hodEmail,
                hodPassword: newDept.hodPassword,
                collegeId: newDept.collegeId
            };
            await API.post('/departments', payload);
            setNewDept({ name: '', hodName: '', hodEmail: '', hodPassword: '', confirmPassword: '', collegeId: '' });
            setIsModalOpen(false);
            showSuccessAlert('Success!', 'College Created Successfully!');
            fetchDepartments();
        } catch (error) {
            showErrorAlert('Error', error.response?.data?.message || 'Failed to create college');
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await showConfirmAlert('Delete College?', 'Are you sure? This action cannot be undone.');
        if (isConfirmed) {
            try {
                await API.delete(`/departments/${id}`);
                setDepartments(departments.filter(d => d._id !== id));
                showSuccessAlert('Deleted!', 'College Deleted Successfully');
            } catch (error) {
                showErrorAlert('Error', 'Failed to delete college');
            }
        }
    };

    const handleToggleStatus = async (dept) => {
        try {
            const { data } = await API.put(`/departments/${dept._id}/toggle-status`);
            setDepartments(departments.map(d => d._id === dept._id ? { ...d, isActive: data.isActive } : d));
            showSuccessAlert('Status Updated', `College is now ${data.isActive ? 'Active' : 'Inactive'}`);
        } catch (error) {
            showErrorAlert('Error', 'Failed to update status');
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-fade-in relative">

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg"
                    >
                        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Building2 size={24} className="text-blue-600" /> New College
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-4">

                            {/* College Name & ID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">College Name</label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={newDept.name}
                                            onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                            placeholder="College Name"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">College ID</label>
                                    <div className="relative">
                                        <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={newDept.collegeId}
                                            onChange={e => setNewDept({ ...newDept, collegeId: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                            placeholder="e.g. CLG-001"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* College Admin Name & Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">College Admin Name</label>
                                <div className="relative">
                                    <UserCog size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={newDept.hodName}
                                        onChange={e => setNewDept({ ...newDept, hodName: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                        placeholder="College Admin Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">College Gmail</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={newDept.hodEmail}
                                        onChange={e => setNewDept({ ...newDept, hodEmail: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                        placeholder="college@gmail.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            value={newDept.hodPassword}
                                            onChange={e => setNewDept({ ...newDept, hodPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                            placeholder="********"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            value={newDept.confirmPassword}
                                            onChange={e => setNewDept({ ...newDept, confirmPassword: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                            placeholder="********"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                                >
                                    Create and Save
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <Link to="/admin" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2 transition-colors">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </Link>
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Building2 size={32} className="text-blue-600" /> Manage Colleges
                        </h2>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all w-full md:w-auto">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Colleges..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full placeholder-slate-400"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            <span>Add College</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepts.map((dept) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={dept._id}
                            className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group relative flex flex-col"
                        >
                            {/* Decorative Top Gradient */}
                            <div className={`h-2 w-full bg-gradient-to-r ${dept.isActive ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-red-500'}`}></div>

                            <div className="p-5 flex-1 flex flex-col">
                                {/* Header: Icon & Actions */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3.5 rounded-2xl ${dept.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <Building2 size={26} strokeWidth={1.5} />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(dept)}
                                            className={`p-2 rounded-xl transition-all ${dept.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                            title={dept.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {dept.isActive ? <CheckCircle size={18} /> : <X size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete College"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Title & ID */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                        {dept.name}
                                    </h3>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 font-mono tracking-wide">
                                        <ShieldCheck size={12} />
                                        {dept.collegeId || 'NO-ID'}
                                    </div>
                                </div>

                                {/* Main Info Section - College Admin Details */}
                                <div className="space-y-4 mb-6">
                                    {dept.hod ? (
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group/creds hover:border-blue-200 transition-colors">
                                            <div className="flex items-center gap-3 mb-3 pt-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {dept.hod.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Administrator</p>
                                                    <p className="text-sm font-bold text-slate-800">{dept.hod.name}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                                                    <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg"><Mail size={14} /></div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Login Email</p>
                                                        <p className="text-xs font-semibold text-slate-700 truncate" title={dept.hod.email}>{dept.hod.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                                                    <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Key size={14} /></div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Password</p>
                                                        {dept.adminPassword ? (
                                                            <div className="flex items-center justify-between group/pass cursor-pointer">
                                                                <input
                                                                    type="password"
                                                                    value={dept.adminPassword}
                                                                    readOnly
                                                                    className="w-24 bg-transparent border-none p-0 text-xs font-mono font-bold text-slate-600 outline-none cursor-pointer hover:text-emerald-600 focus:text-emerald-700"
                                                                    onFocus={(e) => e.target.type = 'text'}
                                                                    onBlur={(e) => e.target.type = 'password'}
                                                                />
                                                                <span className="text-[10px] text-emerald-600 opacity-0 group-hover/pass:opacity-100 transition-opacity font-bold">Show</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Not Saved</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                                            <AlertCircle size={24} className="text-amber-500 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-amber-700">No Admin Assigned</p>
                                            <p className="text-xs text-amber-600 mt-1">Please assign an admin.</p>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Footer Status Bar */}
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Created: {new Date(dept.createdAt).toLocaleDateString()}</span>
                                <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md ${dept.isActive ? 'text-emerald-600 bg-emerald-100/50' : 'text-rose-600 bg-rose-100/50'}`}>
                                    <span className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {dept.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {filteredDepts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400">
                            {loading ? 'Loading...' : 'No result found.'}
                        </div>
                    )}
                </div>

                {/* HOD Directory Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <UserCog size={28} className="text-violet-600" /> College Admins Directory
                    </h2>
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 rounded-2xl bg-violet-100 text-violet-600">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-slate-800">All Admins</h3>
                                <p className="text-slate-500">List of all active College administrators</p>
                            </div>
                            <div className="relative w-full md:w-auto min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search HODs..."
                                    value={hodSearch}
                                    onChange={(e) => setHodSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {hods.filter(h => h.name.toLowerCase().includes(hodSearch.toLowerCase()) || h.email.toLowerCase().includes(hodSearch.toLowerCase())).map((hod) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={hod._id}
                                            className="hover:bg-slate-50 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold shadow-md shadow-violet-500/20">
                                                        {hod.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{hod.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-500 font-medium">{hod.email}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 w-fit ${hod.isBlocked ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${hod.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                    {hod.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleBlockHod(hod)}
                                                        className={`p-2 rounded-xl transition-all ${hod.isBlocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                                        title={hod.isBlocked ? "Unblock" : "Block"}
                                                    >
                                                        <UserCheck size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHod(hod._id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {hods.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-8 text-slate-400">No HODs found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManageColleges;
