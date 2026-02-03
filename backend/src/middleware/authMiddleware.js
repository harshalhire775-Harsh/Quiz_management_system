const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }

            // Check if password changed after token was issued
            if (user.passwordChangedAt) {
                const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
                // decoded.iat is in seconds
                if (decoded.iat < changedTimestamp) {
                    res.status(401).json({ message: 'Session expired, password changed. Please login again.' });
                    return;
                }
            }

            if (user.isBlocked) {
                res.status(403).json({ message: 'Your account has been blocked. Contact Super Admin.' });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'Super Admin' || req.user.role === 'Admin (HOD)' || req.user.role === 'Sir')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Super Admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as Super Admin' });
    }
};

const instructorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Sir' || req.user.role === 'Admin (HOD)' || req.user.isAdmin)) {
        // Super Admin is explicitly NOT included here for content creation if we want to restrict them.
        // However, req.user.isAdmin is often true for Super Admin in the seed.
        // Let's check the seed: Super Admin has isAdmin: true.
        // So if we want to RESTRICT Super Admin, we must explicitly exclude them or ensure they don't pass this check if we rely on names.

        if (req.user.role === 'Super Admin') {
            res.status(403).json({ message: 'Super Admin is not allowed to create content.' });
            return;
        }
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as Instructor or Admin' });
    }
};

module.exports = { protect, admin, superAdmin, instructorOrAdmin };
