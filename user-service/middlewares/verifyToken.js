import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError.js"
import User from "../models/user.model.js"

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(401).json(new apiError("Unauthorized", 401))
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded?.userId)
        if (!user) {
            throw new apiError("Invalid token. User does not exist", 401)
        }
        req.user = user
        next()
    }
    catch (error) {
        return res.status(401).json(new apiError("Invalid or expired token", 401))
    }
}

export default verifyJWT
