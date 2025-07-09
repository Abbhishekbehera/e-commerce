import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const secret_key = process.env.jwt_key

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        res.status(403).json({ message: 'Access Denied.' })
    }
    try {
        const existingUser = jwt.verify(token, secret_key)
        req.user = existingUser
        next()
    }
    catch (e) {
        res.status(500).json({ message: 'Server down.' })
    }
}