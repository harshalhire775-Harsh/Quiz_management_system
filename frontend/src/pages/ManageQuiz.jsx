import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, CheckCircle, Edit, Save, X, Zap, LayoutList, FileText, CheckSquare, Globe, HelpCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import API from '../api/axios';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/sweetAlert';

const ManageQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        correctAnswers: [],
        type: 'MCQ',
        explanation: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizRes, questionsRes] = await Promise.all([
                    API.get(`/quizzes/${id}`),
                    API.get(`/questions/quiz/${id}`)
                ]);
                setQuiz(quizRes.data);
                setQuestions(questionsRes.data);
            } catch (error) {
                console.error('Failed to fetch quiz data', error);
            }
        };
        fetchData();
    }, [id]);

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            if (editingQuestionId) {
                const { data } = await API.put(`/questions/${editingQuestionId}`, newQuestion);
                setQuestions(questions.map(q => q._id === editingQuestionId ? data : q));
                setEditingQuestionId(null);
                showSuccessAlert('Updated!', 'Question updated successfully');
            } else {
                const { data } = await API.post('/questions', { ...newQuestion, quizId: id });
                setQuestions([...questions, data]);
                showSuccessAlert('Added!', 'Question added successfully');
            }

            setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '', correctAnswers: [], type: 'MCQ', explanation: '' });
            setShowAddForm(false);
        } catch (error) {
            showErrorAlert('Error', 'Failed to save question');
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            showErrorAlert('Missing File', 'Please select an Excel or CSV file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        try {
            const { data } = await API.post(`/questions/bulk-upload/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Refresh questions
            const questionsRes = await API.get(`/questions/quiz/${id}`);
            setQuestions(questionsRes.data);

            showSuccessAlert('Success!', `${data.count} questions uploaded successfully.`);
            setShowBulkModal(false);
            setSelectedFile(null);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error processing the file.';
            const details = error.response?.data?.details ? `\n\n${error.response.data.details}` : '';
            showErrorAlert('Upload Failed', msg + details);
        } finally {
            setUploading(false);
        }
    };



    const handleDeleteQuestion = async (qId) => {
        const isConfirmed = await showConfirmAlert('Delete Question?', 'This action cannot be undone.');
        if (isConfirmed) {
            try {
                await API.delete(`/questions/${qId}`);
                setQuestions(questions.filter(q => q._id !== qId));
                showSuccessAlert('Deleted', 'Question deleted successfully');
            } catch (error) {
                showErrorAlert('Error', 'Failed to delete question');
            }
        }
    };

    if (!quiz) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Quiz Data...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-900 pb-20">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 z-10"></div>
            </div>

            <div className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-all font-bold group px-4 py-2 rounded-full hover:bg-white/80 w-max"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Dashboard</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider">
                                    {quiz.category || 'General'}
                                </span>
                                <span className="text-slate-400 font-medium text-sm flex items-center gap-1">
                                    <Globe size={14} /> ID: {id.slice(-6)}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2 drop-shadow-sm leading-tight">
                                {quiz.title}
                            </h1>
                            <p className="text-lg text-slate-500 font-medium max-w-2xl text-balance">
                                {quiz.description || "Manage your quiz settings and questions below."}
                            </p>
                        </div>

                        {/* Publish Status Card */}
                        <div className={`p-1 rounded-2xl bg-gradient-to-br ${quiz.isPublished ? 'from-green-400 to-emerald-600' : 'from-amber-300 to-orange-500'} shadow-lg shadow-gray-200/50`}>
                            <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${quiz.isPublished ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {quiz.isPublished ? <CheckCircle size={20} /> : <Zap size={20} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                    <p className={`font-black text-lg ${quiz.isPublished ? 'text-green-600' : 'text-amber-600'}`}>
                                        {quiz.isPublished ? 'Published' : 'Draft Mode'}
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const action = quiz.isPublished ? 'Unpublish' : 'Publish';
                                        const isConfirmed = await showConfirmAlert(`${action} Quiz?`, `Are you sure you want to ${action.toLowerCase()} this quiz?`);
                                        if (isConfirmed) {
                                            try {
                                                const { data } = await API.put(`/quizzes/${id}`, { isPublished: !quiz.isPublished });
                                                setQuiz(data);
                                                showSuccessAlert('Success', `Quiz ${action}ed successfully!`);
                                            } catch (e) {
                                                showErrorAlert('Error', 'Failed to update status');
                                            }
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${quiz.isPublished
                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                        }`}
                                >
                                    {quiz.isPublished ? 'Unpublish' : 'Go Live ->'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats & Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm">
                    <div className="flex items-center gap-6 px-4">
                        <div className="flex items-center gap-2">
                            <LayoutList size={18} className="text-indigo-500" />
                            <span className="font-bold text-slate-700">{questions.length} <span className="text-slate-500 font-medium text-sm">Questions</span></span>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" />
                            <span className="font-bold text-slate-700">{questions.reduce((acc, q) => acc + (q.options?.length || 0), 0)} <span className="text-slate-500 font-medium text-sm">Options</span></span>
                        </div>
                    </div>

                    <div className="flex gap-2 p-1">
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-white text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
                        >
                            <Upload size={18} />
                            <span className="hidden sm:inline">Bulk Upload</span>
                        </button>

                        <button
                            onClick={() => {
                                setEditingQuestionId(null);
                                setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '', correctAnswers: [], type: 'MCQ', explanation: '' });
                                setShowAddForm(!showAddForm);
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${showAddForm
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                                }`}
                        >
                            {showAddForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Question</>}
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden mb-8"
                        >
                            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-indigo-50 p-6 md:p-8 relative">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <HelpCircle size={150} />
                                </div>

                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            {editingQuestionId ? <Edit size={20} /> : <Plus size={20} />}
                                        </div>
                                        {editingQuestionId ? 'Edit Question' : 'Create Question'}
                                    </h3>

                                    {!editingQuestionId && (
                                        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                                            {['MCQ', 'MSQ', 'TF'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setNewQuestion({ ...newQuestion, type: t, options: t === 'TF' ? ['True', 'False'] : ['', '', '', ''], correctAnswers: [], correctAnswer: '' })}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newQuestion.type === t
                                                        ? 'bg-white text-indigo-600 shadow-sm'
                                                        : 'text-slate-500 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    {t === 'TF' ? 'True/False' : t === 'MSQ' ? 'Multiple Choice' : 'Single Choice'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleAddQuestion} className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Question Text</label>
                                        <textarea
                                            rows="3"
                                            value={newQuestion.questionText}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-lg text-slate-800 placeholder-slate-400 transition-all resize-none"
                                            placeholder="Type your question here..."
                                            required
                                        />
                                    </div>

                                    {newQuestion.type !== 'TF' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {newQuestion.options.map((option, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Option {idx + 1}</label>
                                                    <div className="relative group">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500">{String.fromCharCode(65 + idx)}</span>
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...newQuestion.options];
                                                                newOptions[idx] = e.target.value;
                                                                setNewQuestion({ ...newQuestion, options: newOptions });
                                                            }}
                                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none font-medium text-slate-700 transition-all"
                                                            placeholder={`Option text...`}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                        <label className="block text-sm font-bold text-emerald-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <CheckCircle size={16} /> Set Correct Answer(s)
                                        </label>

                                        {/* TF Selection */}
                                        {newQuestion.type === 'TF' && (
                                            <div className="flex gap-4">
                                                {['True', 'False'].map(opt => (
                                                    <label key={opt} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${newQuestion.correctAnswer === opt ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                                        <input
                                                            type="radio"
                                                            name="correctAnswer"
                                                            value={opt}
                                                            checked={newQuestion.correctAnswer === opt}
                                                            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                                            className="hidden"
                                                        />
                                                        <span className="font-black text-lg">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {/* MCQ Selection */}
                                        {newQuestion.type === 'MCQ' && (
                                            <div className="relative">
                                                <select
                                                    value={newQuestion.correctAnswer}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-white border-2 border-emerald-200 text-slate-800 font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer"
                                                    required
                                                >
                                                    <option value="">Select the correct option from the list</option>
                                                    {newQuestion.options.map((opt, idx) => (
                                                        opt && <option key={idx} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                                                    <CheckCircle size={20} />
                                                </div>
                                            </div>
                                        )}

                                        {/* MSQ Selection */}
                                        {newQuestion.type === 'MSQ' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {newQuestion.options.map((opt, idx) => (
                                                    opt && (
                                                        <label key={idx} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${newQuestion.correctAnswers.includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-white border-emerald-100 hover:border-emerald-300'}`}>
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${newQuestion.correctAnswers.includes(opt) ? 'border-white bg-white/20' : 'border-slate-300 bg-white'}`}>
                                                                {newQuestion.correctAnswers.includes(opt) && <CheckSquare size={14} className="text-white" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={newQuestion.correctAnswers.includes(opt)}
                                                                onChange={(e) => {
                                                                    const current = newQuestion.correctAnswers;
                                                                    if (e.target.checked) {
                                                                        setNewQuestion({ ...newQuestion, correctAnswers: [...current, opt] });
                                                                    } else {
                                                                        setNewQuestion({ ...newQuestion, correctAnswers: current.filter(a => a !== opt) });
                                                                    }
                                                                }}
                                                                className="hidden"
                                                            />
                                                            <span className="font-bold">{opt}</span>
                                                        </label>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Explanation (Optional)</label>
                                        <div className="relative group mt-1">
                                            <div className="absolute left-4 top-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors">
                                                <Zap size={18} />
                                            </div>
                                            <textarea
                                                rows="2"
                                                value={newQuestion.explanation}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-amber-50/50 border-2 border-amber-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all resize-none"
                                                placeholder="Explain why the answer is correct..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {editingQuestionId ? <Save size={20} /> : <Plus size={20} />}
                                        {editingQuestionId ? 'Update Question' : 'Save & Add Question'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Questions List */}
                <div className="space-y-6">
                    {questions.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <HelpCircle size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No Questions Yet</h3>
                            <p className="text-slate-500">Start building your quiz by adding the first question.</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-6 text-indigo-600 font-bold hover:underline"
                            >
                                Open Question Editor
                            </button>
                        </div>
                    ) : (
                        questions.map((q, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={q._id}
                                className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                                                {index + 1}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${q.type === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                                                q.type === 'MSQ' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {q.type === 'TF' ? 'True / False' : q.type}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800 mb-4 leading-snug">
                                            {q.questionText}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                                            {q.options.filter(o => o).map((opt, i) => {
                                                const isCorrect = (q.type === 'MCQ' || q.type === 'TF') ? opt === q.correctAnswer : q.correctAnswers?.includes(opt);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border text-sm font-medium transition-colors ${isCorrect
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                            : 'bg-slate-50 border-transparent text-slate-600'
                                                            }`}
                                                    >
                                                        <span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                            {String.fromCharCode(65 + i)}.
                                                        </span>
                                                        <span>{opt}</span>
                                                        {isCorrect && <CheckCircle size={16} className="ml-auto text-emerald-500 shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {q.explanation && (
                                            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3 text-sm text-amber-800">
                                                <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                <p><span className="font-bold">Explanation:</span> {q.explanation}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setNewQuestion({
                                                    questionText: q.questionText,
                                                    options: q.options,
                                                    correctAnswer: q.correctAnswer,
                                                    correctAnswers: q.correctAnswers || [],
                                                    type: q.type || 'MCQ',
                                                    explanation: q.explanation || ''
                                                });
                                                setEditingQuestionId(q._id);
                                                setShowAddForm(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Edit Question"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(q._id)}
                                            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            title="Delete Question"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {showBulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBulkModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Upload size={20} />
                                    </div>
                                    Bulk Upload
                                </h3>
                                <button
                                    onClick={() => setShowBulkModal(false)}
                                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                                            <FileText size={32} />
                                        </div>
                                        <h4 className="font-bold text-slate-800">Select Your File</h4>
                                        <p className="text-sm text-slate-500 mb-6">Choose the completed Excel/CSV file from your device.</p>

                                        <label className="w-full">
                                            <input
                                                type="file"
                                                accept=".xlsx, .xls, .csv"
                                                className="hidden"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                            <div className={`w-full py-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${selectedFile ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-500'}`}>
                                                <span className="font-bold">{selectedFile ? selectedFile.name : 'Click to Browse'}</span>
                                                <span className="text-xs">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'XLSX, XLS or CSV only'}</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowBulkModal(false)}
                                        className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBulkUpload}
                                        disabled={!selectedFile || uploading}
                                        className="flex-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {uploading ? 'Processing Bitstream...' : 'Start Import'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageQuiz;
