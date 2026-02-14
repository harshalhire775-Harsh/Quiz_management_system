import React from 'react';

const Blog = () => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Our Blog</h1>
                    <p className="text-lg text-slate-600">Latest updates, news, and insights from QuizPro.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Blog Post 1 */}
                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-slate-200"></div>
                        <div className="p-6">
                            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">Features</span>
                            <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">Introducing New Quiz Types</h3>
                            <p className="text-slate-500 mb-4 text-sm">Explore our latest quiz formats designed to make learning more engaging.</p>
                            <a href="#" className="text-slate-900 font-bold hover:text-indigo-600">Read More →</a>
                        </div>
                    </div>

                    {/* Blog Post 2 */}
                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-slate-200"></div>
                        <div className="p-6">
                            <span className="text-green-600 text-xs font-bold uppercase tracking-wider">Updates</span>
                            <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">Platform Performance Boost</h3>
                            <p className="text-slate-500 mb-4 text-sm">We've optimized our backend for faster quiz loading times.</p>
                            <a href="#" className="text-slate-900 font-bold hover:text-indigo-600">Read More →</a>
                        </div>
                    </div>

                    {/* Blog Post 3 */}
                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-slate-200"></div>
                        <div className="p-6">
                            <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">Education</span>
                            <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">The Future of Online Learning</h3>
                            <p className="text-slate-500 mb-4 text-sm">How digital assessment tools are reshaping education globally.</p>
                            <a href="#" className="text-slate-900 font-bold hover:text-indigo-600">Read More →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;
