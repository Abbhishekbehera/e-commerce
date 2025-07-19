const authorizeRole = (...allowRole) => {
    return (req, res, next) => {
        try {
        
            if (!req.user || !allowRole.includes(req.user.role)) {
                return res.status(403).json({ message: "Invalid Authorization role." })
            }
            next()
        } catch (e) {
            console.log("Role Error :", e)
            res.status().json({ message: "Server error in authorization" })
        }
    }
}
export default authorizeRole