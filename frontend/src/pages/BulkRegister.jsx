import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
// import * as XLSX from 'xlsx'; // Removed as we handle template via simple CSV string

// Note: installing xlsx on frontend is optional if we just want to download a dummy file constructed here.
// For now, no external lib needed on frontend just to upload.

const BulkRegister = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError('');
    };

    const handleDownloadTemplate = () => {
        // Create a simple CSV/Excel template
        const headers = ['Name,Email,Role'];
        const rows = ['John Doe,john@example.com,Student', 'Jane Smith,jane@example.com,Sir'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join('\n') + '\n' + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_import_template.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError('');

        try {
            const { data } = await API.post('/users/bulk-register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(data);
            setFile(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload file.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Bulk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">User Import</span>
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Upload Excel/CSV to register multiple users at once</p>
                    </div>
                </div>

                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <Download size={20} />
                    <span>Download Template</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
                >
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                            <FileSpreadsheet size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Upload your file here</h3>
                        <p className="text-slate-500 text-center max-w-xs mb-8">
                            Supports .xlsx, .xls or .csv files with columns: Name, Email, Role
                        </p>

                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                            {file ? file.name : 'Select File'}
                        </label>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                            <AlertCircle size={20} />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${!file || loading
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Upload size={24} />
                                Start Import
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Results Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full min-h-[400px]"
                >
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        Import Status
                    </h3>

                    {!result && !loading && (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                            <Upload size={48} className="mb-4 opacity-20" />
                            <p>Upload a file to see results here</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-64 flex flex-col items-center justify-center text-blue-500">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                            <p className="font-medium">Importing users and sending emails...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-center">
                                    <span className="block text-3xl font-black">{result.summary.success}</span>
                                    <span className="text-sm font-bold">Successful</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 text-center">
                                    <span className="block text-3xl font-black">{result.summary.failed}</span>
                                    <span className="text-sm font-bold">Failed</span>
                                </div>
                            </div>

                            {result.summary.errors.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-slate-700 mb-3">Error Log</h4>
                                    <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-slate-100 space-y-2">
                                        {result.summary.errors.map((err, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-red-600 p-2 bg-white rounded-lg border border-red-50">
                                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="font-bold block">{err.email || 'Unknown User'}</span>
                                                    <span className="opacity-80">{err.message}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.summary.errors.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-2xl border border-green-100 text-green-700">
                                    <CheckCircle size={48} className="mb-2" />
                                    <p className="font-bold text-lg">All users imported successfully!</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default BulkRegister;
