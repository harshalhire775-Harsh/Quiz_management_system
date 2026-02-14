import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Effective Date: February 2026</p>
                </div>

                <div className="prose prose-slate max-w-none prose-lg">
                    <h3 className="font-bold text-slate-900 text-2xl mb-4">1. Information Collection</h3>
                    <p className="mb-6">
                        We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address or phone number.
                    </p>

                    <h3 className="font-bold text-slate-900 text-2xl mb-4">2. Use of Information</h3>
                    <p className="mb-6">
                        Any of the information we collect from you may be used in one of the following ways:
                        <ul className="list-disc pl-6 mt-2 mb-4">
                            <li>To personalize your experience (your information helps us to better respond to your individual needs)</li>
                            <li>To improve our website (we continually strive to improve our website offerings based on the information and feedback we receive from you)</li>
                            <li>To improve customer service (your information helps us to more effectively respond to your customer service requests and support needs)</li>
                        </ul>
                    </p>

                    <h3 className="font-bold text-slate-900 text-2xl mb-4">3. Data Protection</h3>
                    <p className="mb-6">
                        We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
                    </p>

                    <h3 className="font-bold text-slate-900 text-2xl mb-4">4. Cookies</h3>
                    <p className="mb-6">
                        Yes (Cookies are small files that a site or its service provider transfers to your computers hard drive through your Web browser (if you allow) that enables the sites or service providers systems to recognize your browser and capture and remember certain information).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
