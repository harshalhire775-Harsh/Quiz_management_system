import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
    // Dummy notification data for now
    const notifications = [
        {
            id: 1,
            type: 'info',
            title: 'Welcome to QuizPro!',
            message: 'Get started by taking your first quiz.',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            type: 'success',
            title: 'Quiz Completed',
            message: 'You successfully completed the "Python Basics" quiz.',
            time: '1 day ago',
            read: true
        },
        {
            id: 3,
            type: 'warning',
            title: 'Maintenance Update',
            message: 'System will be under maintenance tonight at 12 AM.',
            time: '2 days ago',
            read: true
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h1 className="text-3xl font-black text-slate-800 mb-2">Notifications</h1>
                <p className="text-slate-500 font-medium">Stay updated with your latest activities and announcements.</p>
            </div>

            <div className="space-y-4">
                {notifications.map((note) => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-2xl border flex gap-4 ${note.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${note.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                note.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                    'bg-blue-100 text-blue-600'
                            }`}>
                            {note.type === 'success' ? <CheckCircle size={24} /> :
                                note.type === 'warning' ? <AlertTriangle size={24} /> :
                                    <Info size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-800">{note.title}</h3>
                                {!note.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                            </div>
                            <p className="text-slate-600 text-sm mb-2">{note.message}</p>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{note.time}</span>
                        </div>
                    </motion.div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <Bell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
