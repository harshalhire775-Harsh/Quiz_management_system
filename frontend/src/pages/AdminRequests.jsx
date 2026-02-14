import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, X, Check, Search, ShieldAlert, Building2, Mail, Lock, Key } from 'lucide-react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalData, setApprovalData] = useState({
        collegeId: '',
        password: '',
        collegeName: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // We need an endpoint for pending requests. 
            // Currently getting all users and filtering might be inefficient but works for now.
            // Or we user /users/admins and filter.
            const { data } = await API.get('/users/admins'); // Assuming this returns admins/hods
            // Filter where isApproved is false
            const pending = data.filter(u => !u.isApproved && u.role === 'Admin (HOD)');
            setRequests(pending);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCredentials = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        // Generate College ID
        let id = 'CLG-';
        for (let i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));

        return { id };
    };

    const handleOpenOption = (req) => {
        const { id } = generateCredentials();
        setApprovalData({
            collegeId: id,
            password: '', // Default to empty (keep user password)
            collegeName: req.department || ''
        });
        setSelectedRequest(req);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        if (!approvalData.collegeName) {
            showErrorAlert("Error", "College Name is required");
            return;
        }

        try {
            await API.put(`/users/${selectedRequest._id}/approve`, {
                newPassword: approvalData.password,
                collegeId: approvalData.collegeId,
                collegeName: approvalData.collegeName,
                createDepartment: true // Flag to tell backend to create dept
            });
            showSuccessAlert('Approved!', 'Request Approved! College Created and Email Sent.');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', error.response?.data?.message || 'Approval Failed');
        }
    };

    const handleReject = async (id) => {
        const isConfirmed = await showConfirmAlert('Reject Request?', 'Are you sure you want to reject and delete this request?');
        if (isConfirmed) {
            try {
                await API.delete(`/auth/users/${id}`);
                setRequests(requests.filter(r => r._id !== id));
                showSuccessAlert('Rejected', 'Request rejected and deleted.');
            } catch (error) {
                showErrorAlert('Error', 'Failed to reject request');
            }
        }
    };

    const filteredRequests = requests.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department && r.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-fade-in relative">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <ShieldAlert size={32} className="text-amber-500" /> Administrative Requests
                        </h2>
                        <p className="text-slate-500 mt-1 font-medium">Review and approve college registration requests.</p>
                    </div>

                    <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm w-full md:w-auto">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full placeholder-slate-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map((req) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl">
                                    {req.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        {req.name}
                                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">Pending</span>
                                    </h3>
                                    <div className="text-sm text-slate-500 font-medium flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1"><Mail size={14} /> {req.email}</span>
                                        <span className="flex items-center gap-1 text-blue-600"><Building2 size={14} /> {req.department || 'No College Name'}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg inline-block">
                                        Applied: {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleReject(req._id)}
                                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Reject
                                </button>
                                <button
                                    onClick={() => handleOpenOption(req)}
                                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Approve
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                                <UserCheck size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">No Pending Requests</h3>
                            <p className="text-slate-400 text-sm">All administrative requests have been processed.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Approval Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
                        >
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Approve Institution</h3>
                            <p className="text-slate-500 text-sm mb-6">Review credentials before granting access.</p>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-3">
                                <div className="text-sm text-slate-600"><span className="font-bold text-slate-800">Admin:</span> {selectedRequest.name}</div>
                                <div className="text-sm text-slate-600"><span className="font-bold text-slate-800">College:</span> {selectedRequest.department}</div>
                                <div className="text-sm text-slate-600"><span className="font-bold text-slate-800">Email:</span> {selectedRequest.email}</div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1 block">Confirmed College Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={approvalData.collegeName}
                                            onChange={(e) => setApprovalData({ ...approvalData, collegeName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium text-slate-700"
                                            placeholder="Enter College Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1 block">Assign College ID</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={approvalData.collegeId}
                                            onChange={(e) => setApprovalData({ ...approvalData, collegeId: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-mono font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1 block">Set Admin Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={approvalData.password}
                                            onChange={(e) => setApprovalData({ ...approvalData, password: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-mono font-bold text-slate-700"
                                            placeholder="Leave empty to keep user password"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 ml-1">If set, new password will be emailed. If empty, user uses their registration password.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    Confirm Approval
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRequests;
