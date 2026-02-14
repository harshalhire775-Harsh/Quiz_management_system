import React from 'react';
import { FaSearch, FaQuestionCircle, FaBook, FaUserShield } from 'react-icons/fa';

const HelpCenter = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-6">How can we help?</h1>
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            className="w-full px-6 py-4 rounded-full border border-slate-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-14"
                            placeholder="Search for answers..."
                        />
                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: <FaUserShield />, title: "Account & Login", desc: "Issues with signing in or profile." },
                        { icon: <FaQuestionCircle />, title: "Quiz Help", desc: "How to create or take quizzes." },
                        { icon: <FaBook />, title: "Billing & Plans", desc: "Manage your subscription." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer text-center">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Popular Articles</h3>
                    <ul className="space-y-4">
                        {['How to reset my password?', 'Can I retry a quiz?', 'Is my data secure?'].map((q, i) => (
                            <li key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                <a href="#" className="flex justify-between items-center group">
                                    <span className="text-slate-700 font-medium group-hover:text-indigo-600">{q}</span>
                                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
