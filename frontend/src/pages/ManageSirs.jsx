import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Search, UserCheck, Briefcase, ArrowLeft, CheckCircle, X, Lock, Edit, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';


const ManageSirs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const filterDept = location.state?.filterDept;

    const [sirs, setSirs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Filter Modal State
    const [selectedSir, setSelectedSir] = useState(null);

    // Edit Subject Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSubject, setEditSubject] = useState([]);
    const [newSubject, setNewSubject] = useState('');

    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordToChange, setPasswordToChange] = useState('');

    const fetchSirs = async () => {
        try {
            const { data } = await API.get('/users/sirs');

            // Filter out self (current user) to avoid HOD seeing themselves
            let otherUsers = data.filter(s => s._id !== user?._id);

            // Filter by department if passed from state
            if (filterDept) {
                otherUsers = otherUsers.filter(s => s.department === filterDept);
            }

            setSirs(otherUsers);
        } catch (error) {
            console.error("Failed to fetch sirs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSirs();
    }, [filterDept]);



    const handleDelete = async (id) => {
        const isConfirmed = await showConfirmAlert('Delete Instructor?', 'Are you sure you want to delete this Instructor? This action cannot be undone.');
        if (isConfirmed) {
            try {
                await API.delete(`/users/${id}`);
                setSirs(sirs.filter(sir => sir._id !== id));
                showSuccessAlert('Deleted!', 'Instructor has been deleted.');
            } catch (error) {
                showErrorAlert('Error', 'Failed to delete instructor');
            }
        }
    };

    const handleBlockToggle = async (sir) => {
        const action = sir.isBlocked ? 'unblock' : 'block';
        const isConfirmed = await showConfirmAlert(
            `${action === 'block' ? 'Block' : 'Unblock'} Instructor?`,
            `Are you sure you want to ${action} ${sir.name}?`
        );

        if (isConfirmed) {
            try {
                await API.put(`/users/${sir._id}/${action}`);
                showSuccessAlert('Success!', `User has been ${action}ed.`);
                fetchSirs();
            } catch (error) {
                console.error(error);
                showErrorAlert('Error', `Failed to ${action} user`);
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!selectedSir || !passwordToChange) return;

        if (passwordToChange.length < 6) {
            showErrorAlert('Error', 'Password must be at least 6 characters long');
            return;
        }

        try {
            await API.put(`/auth/users/${selectedSir._id}/change-password`, { password: passwordToChange });
            setShowPasswordModal(false);
            setPasswordToChange('');
            showSuccessAlert('Success', `Password updated for ${selectedSir.name}`);
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', error.response?.data?.message || 'Failed to update password');
        }
    };

    const openPasswordModal = (sir) => {
        setSelectedSir(sir);
        setPasswordToChange('');
        setShowPasswordModal(true);
    };

    const openEditModal = (sir) => {
        setSelectedSir(sir);
        setEditSubject(Array.isArray(sir.subject) ? sir.subject : (sir.subject ? [sir.subject] : []));
        setShowEditModal(true);
    };

    const handleUpdateSubject = async (e) => {
        e.preventDefault();
        if (!selectedSir) return;

        // Combine existing list with any pending input
        let finalSubjects = [...editSubject];
        const pending = newSubject.trim();
        if (pending && !finalSubjects.includes(pending)) {
            finalSubjects.push(pending);
        }

        try {
            await API.put(`/users/${selectedSir._id}/subject`, { subject: finalSubjects });
            setShowEditModal(false);
            setNewSubject(''); // Clear input
            fetchSirs();
            showSuccessAlert('Updated!', `Subjects updated for ${selectedSir.name}!`);
        } catch (error) {
            console.error("Failed to update subject", error);
            showErrorAlert('Error', error.response?.data?.message || 'Failed to update subject');
        }
    };

    const handleNewSubjectKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = newSubject.trim();
            if (trimmed && !editSubject.includes(trimmed)) {
                setEditSubject([...editSubject, trimmed]);
                setNewSubject('');
            }
        }
    };

    const removeSubject = (subToRemove) => {
        setEditSubject(editSubject.filter(s => s !== subToRemove));
    };

    const startEditingSubject = (subToEdit) => {
        setNewSubject(subToEdit);
        setEditSubject(editSubject.filter(s => s !== subToEdit));
        // Optional: Focus input programmatically if we had a ref
    };

    const filteredList = sirs.filter(sir =>
        sir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sir.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(sir.subject) ? sir.subject.join(' ').toLowerCase() : (sir.subject || '').toLowerCase()).includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Teachers</span>
                        </h1>

                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/register-sir', { state: { filterDept } })}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    <span>Onboard New Teacher</span>
                </button>
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
                        <Briefcase size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-800">
                            {filterDept ? `Faculty: ${filterDept}` : 'Full Faculty Directory'}
                        </h3>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                            {filterDept ? `Folder: ${filterDept}` : 'All Teachers'}
                        </p>
                    </div>
                    <div className="relative w-full md:w-auto min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email or subject..."
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
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Instructor</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredList.map((sir) => (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={sir._id}
                                    className="hover:bg-slate-50 transition-colors group"
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/20 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                                {sir.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-lg">{sir.name}</div>
                                                <div className="text-slate-500 text-sm font-medium">{sir.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex flex-col items-start gap-2">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {Array.isArray(sir.subject) && sir.subject.length > 0 ? (
                                                    sir.subject.map((sub, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">
                                                            {sub}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm">
                                                        {sir.subject || 'Not Assigned'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => openEditModal(sir)}
                                                className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-all"
                                                title="Edit Subjects"
                                            >
                                                <Edit size={14} />
                                                <span>Edit Subjects</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 w-fit ${sir.isBlocked ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            <span className={`w-2 h-2 rounded-full ${sir.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                            {sir.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleBlockToggle(sir)}
                                                className={`p-2.5 rounded-xl transition-all ${sir.isBlocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}
                                                title={sir.isBlocked ? "Unblock Sir" : "Block Sir"}
                                            >
                                                <UserCheck size={20} />
                                            </button>
                                            <button
                                                onClick={() => openPasswordModal(sir)}
                                                className="p-2.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Change Password"
                                            >
                                                <Lock size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sir._id)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Sir"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredList.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-medium">
                                        No active instructors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Edit Subject Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Edit Subjects</h2>
                                    <p className="text-slate-500 text-sm mt-1">Assign subjects for {selectedSir?.name}</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSubject} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Subject Specialization</label>

                                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all">
                                        {editSubject.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {editSubject.map((sub, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-violet-700 border border-violet-200 rounded-lg text-sm font-bold shadow-sm group/chip">
                                                        <span
                                                            onClick={() => startEditingSubject(sub)}
                                                            className="cursor-pointer hover:underline decoration-violet-400 underline-offset-2"
                                                            title="Click to edit"
                                                        >
                                                            {sub}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubject(sub)}
                                                            className="text-violet-400 hover:text-red-500 transition-colors bg-violet-50 hover:bg-red-50 rounded p-0.5"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2 items-center">
                                            <span className="text-slate-400">
                                                <Briefcase size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                value={newSubject}
                                                onChange={(e) => setNewSubject(e.target.value)}
                                                onKeyDown={handleNewSubjectKeyDown}
                                                placeholder="Type subject & press Enter"
                                                className="w-full bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 ml-1">Press Enter to add a subject</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    Update Subjects
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Change Password</h2>
                                    <p className="text-slate-500 text-sm mt-1">Set new password for {selectedSir?.name}</p>
                                </div>
                                <button onClick={() => setShowPasswordModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={passwordToChange}
                                            onChange={(e) => setPasswordToChange(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 outline-none font-medium text-slate-700"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 ml-1">User will be emailed this password.</p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                                >
                                    Update Password
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageSirs;
