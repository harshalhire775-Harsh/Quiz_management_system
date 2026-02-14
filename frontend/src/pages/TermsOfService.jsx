import React from 'react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Terms of Service</h1>
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Last Updated: February 2026</p>
                </div>

                <div className="prose prose-slate max-w-none prose-lg">
                    <h3 className="font-bold text-slate-900 text-2xl mb-4">1. Acceptance of Terms</h3>
                    <p className="mb-6">
                        By accessing or using the Quiz Management System (the "Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                    </p>

                    <h3 className="font-bold text-slate-900 text-2xl mb-4">2. Use License</h3>
                    <p className="mb-6">
                        Permission is granted to temporarily use the materials (information or software) on the Quiz Management System website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>

                    <h3 className="font-bold text-slate-900 text-2xl mb-4">3. User Accounts</h3>
                    <p className="mb-6">
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>

                    <h3 className="font-bold text-slate-900 text-2xl mb-4">4. Content</h3>
                    <p className="mb-6">
                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
