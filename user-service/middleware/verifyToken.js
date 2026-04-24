import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError.js"
const verifyJWT = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json(new apiError("Unauthorized", 401))
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json(new apiError("Invalid or expired token", 401))
    }
}

export default verifyJWT
