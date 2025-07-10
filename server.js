// Importing modules ==>
import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import authRouter from './routes/authroutes.js'
import upload from './middlewares/upload.js'

// Environmental Variable ==>
dotenv.config()

// Database connection ==>
connectDb()

// Assigning express to app ==>
const app = express();

// Middleware ==>
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('uploads/',express.static('uploads'))

// Routes
app.use('/api/auth',authRouter)



// Server Listening ==>
app.listen(process.env.PORT, () => {
    console.log(`Server is listening to the port ${process.env.PORT}`)
})