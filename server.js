// Importing modules ==>
import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'

//  Variable ==>
dotenv.config()

// Database connection ==>
connectDb()

// Assigning express to app ==>
const app = express();

// Middleware ==>
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.get('/', (req, res) => {
    res.status(200).json({ message: "Server is running !" })
})

// Server Listening ==>
app.listen(process.env.PORT, () => {
    console.log(`Server is listening to the port ${process.env.PORT}`)
})