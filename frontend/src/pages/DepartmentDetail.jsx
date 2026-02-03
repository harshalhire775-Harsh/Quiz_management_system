import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCog, Users, Briefcase, Building2, Info, LayoutDashboard, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import API from '../api/axios';

const DepartmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { deptName } = location.state || { deptName: 'College' };

    // State for sub-departments
    const [subDepts, setSubDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSubDept, setNewSubDept] = useState({ name: '', head: '' });
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch college details to get sub-departments
    useEffect(() => {
        fetchCollegeDetails();
    }, [id]);

    const fetchCollegeDetails = async () => {
        try {
            // Re-using getAll for now, ideal would be getOne. 
            // Optimizing to filter client side as per current backend generic get
            const { data } = await API.get('/departments');
            const currentDept = data.find(d => d._id === id);
            if (currentDept && currentDept.departments) {
                setSubDepts(currentDept.departments);
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubDept = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post(`/departments/${id}/sub-departments`, newSubDept);
            setSubDepts(data);
            setNewSubDept({ name: '', head: '' });
            setShowAddModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add department');
        }
    };

    const handleDeleteSubDept = async (subId) => {
        if (window.confirm('Remove this department?')) {
            try {
                const { data } = await API.delete(`/departments/${id}/sub-departments/${subId}`);
                setSubDepts(data);
            } catch (error) {
                alert('Failed to delete department');
            }
        }
    };

    // State for Search
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSubDepts = subDepts.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.head && sub.head.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/super-admin/departments')}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">{deptName} Panel</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Departments</span> Control Hub
                        </h1>
                    </div>
                </div>
            </div>

            {/* Sub-Departments (Subject Wise) Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Building2 className="text-blue-600" size={24} />
                            Departments
                        </h2>
                        <p className="text-slate-500 text-sm">Manage subject-wise departments (e.g. CS, Mech)</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 w-full md:w-64 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search departments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full placeholder-slate-400"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                        >
                            <Plus size={18} /> Add Department
                        </button>
                    </div>
                </div>

                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200"
                    >
                        <h3 className="font-bold text-slate-700 mb-4">Add New Department</h3>
                        <form onSubmit={handleAddSubDept} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Department Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Computer Science"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200"
                                    value={newSubDept.name}
                                    onChange={e => setNewSubDept({ ...newSubDept, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Head of Dept (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dr. Smith"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200"
                                    value={newSubDept.head}
                                    onChange={e => setNewSubDept({ ...newSubDept, head: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-xl">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubDepts.length > 0 ? (
                        filteredSubDepts.map((sub, idx) => (
                            <div key={sub._id || idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-slate-700">{sub.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium">Head: {sub.head || 'Not Assigned'}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteSubDept(sub._id)}
                                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            {searchQuery ? 'No departments match your search.' : 'No subject-wise departments added yet.'}
                        </div>
                    )}
                </div>
            </div>




            {/* Stats / Info Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 mt-8"
            >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <Info size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">Admin Tip</h4>
                    <p className="text-slate-500 text-sm">You are currently managing 100% of the department's resources from this hub. Actions taken here will only affect the <span className="font-bold text-slate-900">{deptName}</span> resources.</p>
                </div>
            </motion.div>
        </div >
    );
};

export default DepartmentDetail;
