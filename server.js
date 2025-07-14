// Importing modules ==>
import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import authRouter from './routes/authroutes.js'
import adminRouter from './routes/adminRoutes.js'
import sellerRouter from './routes/sellerRoutes.js'
import cusRouter from './routes/cusRoutes.js'

//Environmental Variable ==>
dotenv.config()

//Database connection ==>
connectDb()

//Assigning express to app ==>
const app = express();

//Middleware ==>
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('uploads/',express.static('uploads'))

//Authentication Routes
app.use('/api/auth',authRouter)
//Seller Routes
app.use('/api/seller',sellerRouter)
//Admin Routes
app.use('/api/admin',adminRouter)
// Customer Routes
app.use('/api',cusRouter)


//Server Listening ==>
app.listen(process.env.PORT, () => {
    console.log(`Server is listening to the port ${process.env.PORT}`)
})