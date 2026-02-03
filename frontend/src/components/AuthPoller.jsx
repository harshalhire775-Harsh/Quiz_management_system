import { useEffect } from 'react';
import API from '../api/axios';

const AuthPoller = () => {
    useEffect(() => {
        const checkStatus = async () => {
            const userInfo = sessionStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    // Ping the profile endpoint.
                    // If the user is blocked, this will return 403.
                    // The Axios interceptor will then handle the logout and redirect.
                    await API.get('/auth/profile');
                } catch (error) {
                    // Error is handled by interceptor (if 401/403)
                    // We don't need to do anything here.
                }
            }
        };

        // Initial check on mount
        checkStatus();

        // Check every 10 seconds
        const interval = setInterval(checkStatus, 10000);

        return () => clearInterval(interval);
    }, []);

    return null;
};

export default AuthPoller;
