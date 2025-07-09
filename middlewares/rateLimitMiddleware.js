import rateLimit from 'express-rate-limit'

const rateLimiter=rateLimit({
    windowMs:1*60*1000,
    max:3,
    message:"Try again later"
})

export default rateLimiter