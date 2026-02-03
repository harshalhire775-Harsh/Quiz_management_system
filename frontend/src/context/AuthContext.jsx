import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(sessionStorage.getItem('userInfo')) || null
    );
    const [loading, setLoading] = useState(false);

    // Verify session on mount (Handling Page Refresh)
    useEffect(() => {
        const verifySession = async () => {
            const storedUser = JSON.parse(sessionStorage.getItem('userInfo'));

            if (storedUser && storedUser.token) {
                try {
                    // Attempt to fetch profile to validate token and user existence
                    await API.get('/auth/profile');
                } catch (error) {
                    console.error("Session verification failed:", error);
                    // If 401 or 404 (User deleted), logout immediately
                    logout();
                }
            }
        };

        verifySession();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            sessionStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, phoneNumber, isAdmin, role, department, bio, subject) => {
        setLoading(true);
        try {
            const { data } = await API.post('/auth/register', {
                name,
                email,
                password,
                phoneNumber,
                isAdmin,
                role,
                department,
                bio,
                subject
            });
            setUser(data);
            sessionStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('userInfo');
    };

    const updateUser = (userData) => {
        setUser(userData);
        sessionStorage.setItem('userInfo', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
