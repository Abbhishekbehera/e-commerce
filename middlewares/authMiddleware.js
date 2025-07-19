import jwt from 'jsonwebtoken'

const secret_key = process.env.jwt_key

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        console.log('1');
        const existingUser = jwt.verify(token, secret_key);
        req.user = existingUser;
        console.log('Decoded User:', req.user);
        next();
    } catch (e) {
        console.error('JWT Error:', e);
        return res.status(401).json({ message: 'Invalid or expired token.', error: e.message });
    }
}

export default authMiddleware;
