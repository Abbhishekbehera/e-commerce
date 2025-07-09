// Importing modules ==>
import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import authRouter from './routes/authroutes.js'
import { authMiddleware } from './middlewares/authMiddleware.js'
// Environmental Variable ==>
dotenv.config()

// Database connection ==>
connectDb()

// Assigning express to app ==>
const app = express();

// Middleware ==>
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api',authRouter)



// Server Listening ==>
app.listen(process.env.PORT, () => {
    console.log(`Server is listening to the port ${process.env.PORT}`)
})