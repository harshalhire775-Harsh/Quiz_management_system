import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Search, Trophy, XCircle, Clock } from 'lucide-react';
import API from '../api/axios';

const QuizResults = () => {
    const { id } = useParams(); // Quiz ID
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const [quizRes, resultsRes] = await Promise.all([
                    API.get(`/quizzes/${id}`),
                    API.get(`/results/quiz/${id}`) // Need backend endpoint for this
                ]);
                setQuiz(quizRes.data);
                setResults(resultsRes.data);
            } catch (error) {
                console.error('Failed to fetch results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    const filteredResults = results.filter(r =>
        r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading Data...</div>;

    return (
        <div className="container animate-fade-in p-8" style={{ maxWidth: '1200px' }}>
            <button onClick={() => navigate('/admin/quizzes')} className="btn btn-secondary mb-6 flex items-center gap-2">
                <ArrowLeft size={18} /> Back to My Quizzes
            </button>

            <div className="glass-card p-8 mb-8">
                <h1 className="text-3xl font-black text-slate-800 mb-2">{quiz?.title} Results</h1>
                <div className="flex gap-6 text-slate-500 font-medium text-sm">
                    <span>Total Marks: {quiz?.totalMarks}</span>
                    <span>Passing Marks: {quiz?.passingMarks}</span>
                    <span>Total Attempts: {results.length}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search student name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredResults.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No attempts found matching your search.</td>
                            </tr>
                        ) : (
                            filteredResults.map((result) => {
                                const percentage = (result.score / quiz.totalMarks) * 100;
                                const isPassed = result.score >= quiz.passingMarks;

                                return (
                                    <tr key={result._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700">{result.user.name}</div>
                                                    <div className="text-xs text-slate-400">{result.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-lg">
                                                {result.score} <span className="text-slate-400 text-xs font-normal">/ {quiz.totalMarks}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isPassed ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">
                                                    <Trophy size={14} /> Passed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">
                                                    <XCircle size={14} /> Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-slate-400" />
                                                {new Date(result.createdAt).toLocaleDateString()}
                                                <span className="text-slate-300">|</span>
                                                {new Date(result.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuizResults;
