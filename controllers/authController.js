import user from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const secret_key=process.env.jwt_key

//Register ==>
export const register = async (req, res) => {
    const { username, email, password } = req.body;
    const existingEmail = await user.findOne({ email })
    try {
        if (existingEmail) {
            res.status(403).json({ message: "User already exists." })
            console.log(existingEmail)
        }
        const hasspaasword =await bcrypt.hash(password, 10)
        const newUser = new user({
            username,
            email,
            password: hasspaasword
        })
        await newUser.save()
        console.log(newUser)
        res.status(201).json({ message: "User created successfully." })
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server error." })
    }
}

//Login ==>
export const login = async (req, res) => {
    const { email, password } = req.body
    const existingUser = await user.findOne({ email })
    try {
        if (!existingUser) {
            res.status(403).json({ message: "User does not exist." })
        }
        const compPassword = await bcrypt.compare(password, existingUser.password)
        if (!compPassword) {
            res.status(403).json({ message: "Incorrect password." })
        }
        const token = jwt.sign({
            email: existingUser.email,
            role: existingUser.role
        }, secret_key, { expiresIn: '1h' })
        res.status(200).json({ token })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: "Internal Server is down." })
    }

}    
