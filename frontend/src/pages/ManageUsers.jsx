import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Phone, Calendar, Search, Trash2, Shield, ArrowLeft, Upload, FileSpreadsheet, UserPlus, CheckCircle } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';
import * as XLSX from 'xlsx';

const ManageUsers = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams(); // Get Query Params
    const filterDept = location.state?.filterDept;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);
    const [selectedYear, setSelectedYear] = useState('All');

    const [importStatus, setImportStatus] = useState({
        isOpen: false,
        total: 0,
        current: 0,
        success: 0,
        failed: 0,
        isComplete: false,
        isConfirming: false,
        usersQueue: [],
        errors: []
    });

    // ... existing sync effect ...
    useEffect(() => {
        const yearParam = searchParams.get('year');
        if (yearParam && ['FY', 'SY', 'TY'].includes(yearParam)) {
            setSelectedYear(yearParam);
        } else if (!yearParam && selectedYear !== 'All') {
            setSelectedYear('All');
        }
    }, [searchParams]);

    // ... existing modal state ...
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', phoneNumber: '', department: '', year: '', semester: '', subject: '', password: '' });

    useEffect(() => {
        fetchUsers();
    }, [filterDept]);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/auth/users');
            if (filterDept) {
                setUsers(data.filter(u => u.department === filterDept));
            } else {
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await showConfirmAlert('Delete User?', 'Are you sure you want to delete this user?');
        if (isConfirmed) {
            try {
                await API.delete(`/auth/users/${id}`);
                setUsers(users.filter(user => user._id !== id));
                showSuccessAlert('Deleted!', 'User has been deleted.');
            } catch (error) {
                console.error('Failed to delete user:', error);
                showErrorAlert('Error', 'Failed to delete user');
            }
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        // Wrap single student in array and process via shared logic or keep simple
        // For consistency let's use the new simple one-off logic or just call API
        if (!newStudent.name || !newStudent.email) {
            showErrorAlert('Missing Info', 'Please fill in Name and Email');
            return;
        }
        try {
            setLoading(true);

            // Auto-assign Year if we are in a specific Year folder and user didn't select one
            const inferredYear = newStudent.year || (['FY', 'SY', 'TY'].includes(selectedYear) ? selectedYear : '');

            // Ensure student is added to the EXACT department we are currently viewing
            const studentPayload = {
                ...newStudent,
                year: inferredYear,
                department: newStudent.department || filterDept || newStudent.subject || ''
            };
            const res = await API.post('/auth/bulk-register', [studentPayload]);
            if (res.data.results.success > 0) {
                showSuccessAlert('Success!', 'Student added successfully!');

                // Optimistically update UI immediately
                const addedStudent = {
                    ...studentPayload,
                    year: inferredYear, // Ensure the optimistically added student reflects the inferred year
                    _id: Date.now().toString(), // Temporary ID until refresh
                    role: 'Student',
                    createdAt: new Date().toISOString()
                };
                setUsers(prev => [addedStudent, ...prev]);

                setNewStudent({ name: '', email: '', phoneNumber: '', year: '', semester: '', subject: '', password: '' });
                setIsModalOpen(false);

                // Fetch actual data in background to get real ID
                fetchUsers();
            } else {
                showErrorAlert('Failed', res.data.results.errors[0]?.message || 'Failed to add');
            }
        } catch (error) {
            showErrorAlert('Error', 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const startImportProcess = async () => {
        const usersToUpload = importStatus.usersQueue;

        setImportStatus(prev => ({
            ...prev,
            isConfirming: false, // Switch to progress mode
            current: 0,
            success: 0,
            failed: 0,
            isComplete: false,
            errors: []
        }));

        const results = { success: 0, failed: 0, errors: [] };

        // Process one by one
        for (let i = 0; i < usersToUpload.length; i++) {
            const user = usersToUpload[i];

            setImportStatus(prev => ({ ...prev, current: i + 1 }));

            try {
                const res = await API.post('/auth/bulk-register', [user]);

                if (res.data.results && res.data.results.success > 0) {
                    results.success++;
                    setImportStatus(prev => ({ ...prev, success: prev.success + 1 }));
                } else {
                    results.failed++;
                    const errMsg = res.data.results.errors[0]?.message || 'Unknown error';
                    setImportStatus(prev => ({ ...prev, failed: prev.failed + 1, errors: [...prev.errors, { email: user.email, message: errMsg }] }));
                }
            } catch (error) {
                results.failed++;
                const errMsg = error.response?.data?.message || error.message;
                setImportStatus(prev => ({ ...prev, failed: prev.failed + 1, errors: [...prev.errors, { email: user.email, message: errMsg }] }));
            }
        }

        setImportStatus(prev => ({ ...prev, isComplete: true }));
        fetchUsers();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const usersToUpload = data.map(row => ({
                    name: row.Name || row.name || row['Full Name'] || row['Student Name'],
                    email: row.Email || row.email || row['Email Address'],
                    phoneNumber: row.Phone || row.phone || row['Phone Number'] || row.Mobile || row.mobile || row.Contact,
                    year: row.Year || row.year,
                    semester: row.Semester || row.semester || row['Sem'] || row.sem,
                    subject: row.Subject || row.subject,
                    password: row.Password || row.password,
                    role: row.Role || row.role || 'Student'
                })).filter(u => u.name && u.email);

                if (usersToUpload.length === 0) {
                    showErrorAlert('Invalid File', "No valid users found. Check columns.");
                    return;
                }

                // Open Modal in Confirm Mode
                setImportStatus({
                    isOpen: true,
                    isConfirming: true,
                    total: usersToUpload.length,
                    usersQueue: usersToUpload,
                    current: 0,
                    success: 0,
                    failed: 0,
                    isComplete: false,
                    errors: []
                });

            } catch (error) {
                console.error("Excel error", error);
                showErrorAlert('Error', "Failed to process Excel file.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === 'All' || user.year === selectedYear;
        return matchesSearch && matchesYear;
    });

    if (loading && users.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    // Calculate Progress for Circle
    // If total is 10. Start: current 1. Remaining 10.
    // We want "Count Down". 
    // Remaining = Total - Processed (Success+Failed)
    const processedCount = importStatus.success + importStatus.failed;
    const remainingCount = Math.max(0, importStatus.total - processedCount);
    // For progress circle stroke:
    const progressPercentage = importStatus.total > 0 ? (processedCount / importStatus.total) * 100 : 0;
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-fade-in relative">

            {/* Import Progress/Confirm Modal - Premium Redesign */}
            {importStatus.isOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100]">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl shadow-indigo-500/20 w-full max-w-sm flex flex-col items-center relative overflow-hidden border border-white/50"
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent opacity-50 pointer-events-none"></div>
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

                        {/* CONFIRMATION STATE */}
                        {importStatus.isConfirming ? (
                            <>
                                <div className="z-10 bg-indigo-50 p-6 rounded-full mb-6 relative group">
                                    <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <FileSpreadsheet size={48} className="text-indigo-600 relative z-10" />
                                </div>

                                <h3 className="text-3xl font-black text-slate-800 mb-2 z-10 text-center tracking-tight">
                                    Ready to Import?
                                </h3>
                                <p className="text-slate-500 font-medium text-center mb-8 z-10 max-w-[200px] leading-relaxed">
                                    We found <strong className="text-indigo-600 text-lg">{importStatus.total}</strong> students in your file.
                                </p>

                                <div className="flex flex-col gap-3 w-full z-10">
                                    <button
                                        onClick={startImportProcess}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Start Import
                                    </button>
                                    <button
                                        onClick={() => setImportStatus({ ...importStatus, isOpen: false })}
                                        className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* PROGRESS STATE */
                            <>
                                {/* Status Heading */}
                                <div className="z-10 text-center mb-10">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                        {importStatus.isComplete ? 'All Done!' : 'Importing...'}
                                    </h3>
                                    <p className="text-slate-400 font-medium text-sm mt-1">
                                        {importStatus.isComplete ? 'Your student list is ready.' : 'Please wait while we process.'}
                                    </p>
                                </div>

                                {/* Circular Progress Container */}
                                <div className="relative w-56 h-56 flex items-center justify-center mb-10 z-10">
                                    {/* Outer Glow */}
                                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl"></div>

                                    {/* Background Track */}
                                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg] drop-shadow-sm">
                                        <circle
                                            className="text-slate-100"
                                            strokeWidth="8"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="70"
                                            cx="50%"
                                            cy="50%"
                                        />
                                        {/* Animated Progress Circle */}
                                        <circle
                                            className={`transition-all duration-500 ease-out ${importStatus.isComplete ? 'text-emerald-500' : 'text-indigo-600'}`}
                                            strokeWidth="8"
                                            strokeDasharray={2 * Math.PI * 70}
                                            strokeDashoffset={2 * Math.PI * 70 - (progressPercentage / 100) * (2 * Math.PI * 70)}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="70"
                                            cx="50%"
                                            cy="50%"
                                            style={{ filter: `drop-shadow(0px 0px 6px ${importStatus.isComplete ? '#10b981' : '#4f46e5'})` }}
                                        />
                                    </svg>

                                    {/* Center Content */}
                                    <div className="flex flex-col items-center justify-center relative z-20">
                                        {importStatus.isComplete ? (
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-2"
                                            >
                                                <CheckCircle size={40} strokeWidth={3} />
                                            </motion.div>
                                        ) : (
                                            <div className="relative">
                                                <span className="text-7xl font-black text-slate-800 tracking-tighter tabular-nums block translate-y-[-4px]">
                                                    {remainingCount}
                                                </span>
                                                <span className="absolute top-full left-1/2 -translate-x-1/2 text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full mt-2 whitespace-nowrap">
                                                    Remaining
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Summary Stats Pills */}
                                <div className="grid grid-cols-2 gap-4 w-full z-10">
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-emerald-600">{importStatus.success}</span>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Success</span>
                                    </div>
                                    <div className={`bg-red-50/50 border border-red-100 p-3 rounded-2xl flex flex-col items-center justify-center ${importStatus.failed === 0 ? 'opacity-50 grayscale' : ''}`}>
                                        <span className="text-2xl font-black text-red-600">{importStatus.failed}</span>
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Failed</span>
                                    </div>
                                </div>

                                {/* Close Button (Only when complete) */}
                                <AnimatePresence>
                                    {importStatus.isComplete && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            onClick={() => setImportStatus({ ...importStatus, isOpen: false })}
                                            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-2xl shadow-slate-900/30"
                                        >
                                            Done
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <UserPlus size={24} className="text-blue-600" />
                                Add to {filterDept || 'Global List'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                                <ArrowLeft size={24} className="rotate-180" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newStudent.email}
                                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    placeholder="student@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    value={newStudent.phoneNumber}
                                    onChange={e => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    placeholder="Mobile number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Department (Branch)</label>
                                <input
                                    type="text"
                                    value={newStudent.department || ''}
                                    onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    placeholder="e.g. Computer Science (CS)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Year</label>
                                    <select
                                        value={newStudent.year}
                                        onChange={e => setNewStudent({ ...newStudent, year: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="FY">FY</option>
                                        <option value="SY">SY</option>
                                        <option value="TY">TY</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                                    <select
                                        value={newStudent.semester}
                                        onChange={e => setNewStudent({ ...newStudent, semester: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    >
                                        <option value="">Select Sem</option>
                                        <option value="1">Sem 1</option>
                                        <option value="2">Sem 2</option>
                                        <option value="3">Sem 3</option>
                                        <option value="4">Sem 4</option>
                                        <option value="5">Sem 5</option>
                                        <option value="6">Sem 6</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={newStudent.subject || ''}
                                    onChange={e => setNewStudent({ ...newStudent, subject: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    placeholder="e.g. Mathematics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Password (Optional)</label>
                                <input
                                    type="text"
                                    value={newStudent.password || ''}
                                    onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-medium"
                                    placeholder="Leave blank for auto-generated"
                                />
                                <p className="text-xs text-slate-400 mt-1">If empty, a random password will be emailed.</p>
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
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-2 transition-colors">
                            <ArrowLeft size={18} /> Back
                        </button>
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Users size={32} className="text-blue-600" />
                            {filterDept ? `Students: ${filterDept}` : 'All Students'}
                        </h2>
                        {filterDept && (
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 ml-11">
                                Currently viewing Folder: <span className="text-blue-600">{filterDept}</span>
                            </p>
                        )}

                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all w-full md:w-auto">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full placeholder-slate-400"
                            />
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            <span>Add Student</span>
                        </button>

                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".xlsx, .xls"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                            <FileSpreadsheet size={18} />
                            <span>Import Excel</span>
                        </button>
                    </div>
                </div>



                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                                    <img
                                                        src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                                        alt="avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="font-bold text-slate-700">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                    <Mail size={14} className="text-slate-400" /> {user.email}
                                                </span>
                                                <span className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                    <Phone size={14} className="text-slate-400" /> {user.phoneNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.department?.toLowerCase().includes('cs') || user.department?.toLowerCase().includes('computer')
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                {user.department || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.year ? (
                                                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                    {user.year} {user.semester ? `- Sem ${user.semester}` : ''}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">
                                                    {user.isAdmin ? 'Staff' : 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isAdmin || user.role === 'Admin (HOD)' || user.role === 'Super Admin' ? (
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                                                    <Shield size={12} /> {user.role}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                                                    Student
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!user.isAdmin && user.role !== 'Admin (HOD)' && user.role !== 'Super Admin' && (
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center">
                                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500 font-medium">No users found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
