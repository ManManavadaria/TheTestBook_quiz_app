const jwt = require('jsonwebtoken');
const User = require('../models/User.model'); // Adjust the path as needed

exports.authAdminJWT = async (req, res, next) => {
    try {
        // Check if the Authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: 'Authentication required. Please sign in or register.',
                redirect: '/signin'
            });
        }

        // Check if it's a Bearer token
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                message: 'Invalid authentication format. Please sign in again.',
                redirect: '/signin'
            });
        }

        const token = parts[1];

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error('JWT Verification Error:', {
                name: jwtError.name,
                message: jwtError.message,
                token: token.substring(0, 10) + '...', // Log part of the token for debugging
                error: jwtError
            });

            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    message: 'Invalid token. Please sign in again.',
                    redirect: '/signin'
                });
            } else if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Your session has expired. Please sign in again.',
                    redirect: '/signin'
                });
            } else {
                // For any other JWT-related errors
                return res.status(401).json({
                    message: 'Authentication failed. Please sign in again.',
                    redirect: '/signin'
                });
            }
        }

        // Token is valid, now check if the user still exists in the database
        try {
            const user = await User.findOne({ userId: decoded.userId });
            if (!user) {
                console.log(`User not found for userId: ${decoded.userId}`);
                return res.status(401).json({
                    message: 'User not found. Please register or sign in with a valid account.',
                    redirect: '/signin'
                });
            }

            // Optionally, you can check for token expiration here as well
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                return res.status(401).json({
                    message: 'Your session has expired. Please sign in again.',
                    redirect: '/signin'
                });
            }

            // Check the user's access level
            const { accessLevel } = user;
            if (accessLevel !== 'super admin' && accessLevel !== 'admin') {
                return res.status(403).json({
                    message: 'Access denied. Admins only.',
                    redirect: '/signin'
                });
            }

            // Attach the user to the request object
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        } catch (dbError) {
            console.error('Database Error:', dbError);
            return res.status(500).json({
                message: 'An error occurred while authenticating. Please try again later.',
                redirect: '/signin'
            });
        }

    } catch (error) {
        console.error('Unexpected Authentication Error:', error);
        res.status(500).json({
            message: 'An unexpected error occurred during authentication. Please try again.',
            redirect: '/signin'
        });
    }
};

exports.authSuperAdminJWT = async (req, res, next) => {
    try {
        // Check if the Authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: 'Authentication required. Please sign in or register.',
                redirect: '/signin'
            });
        }

        // Check if it's a Bearer token
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                message: 'Invalid authentication format. Please sign in again.',
                redirect: '/signin'
            });
        }

        const token = parts[1];

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error('JWT Verification Error:', {
                name: jwtError.name,
                message: jwtError.message,
                token: token.substring(0, 10) + '...', // Log part of the token for debugging
                error: jwtError
            });

            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    message: 'Invalid token. Please sign in again.',
                    redirect: '/signin'
                });
            } else if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Your session has expired. Please sign in again.',
                    redirect: '/signin'
                });
            } else {
                // For any other JWT-related errors
                return res.status(401).json({
                    message: 'Authentication failed. Please sign in again.',
                    redirect: '/signin'
                });
            }
        }

        // Token is valid, now check if the user still exists in the database
        try {
            const user = await User.findOne({ userId: decoded.userId });
            if (!user) {
                console.log(`User not found for userId: ${decoded.userId}`);
                return res.status(401).json({
                    message: 'User not found. Please register or sign in with a valid account.',
                    redirect: '/signin'
                });
            }

            // Check the user's access level
            const { accessLevel } = user;
            if (accessLevel !== 'super admin') {
                return res.status(403).json({
                    message: 'Access denied. Super Admins only.',
                    redirect: '/signin'
                });
            }

            // Attach the user to the request object
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        } catch (dbError) {
            console.error('Database Error:', dbError);
            return res.status(500).json({
                message: 'An error occurred while authenticating. Please try again later.',
                redirect: '/signin'
            });
        }

    } catch (error) {
        console.error('Unexpected Authentication Error:', error);
        res.status(500).json({
            message: 'An unexpected error occurred during authentication. Please try again.',
            redirect: '/signin'
        });
    }
};
