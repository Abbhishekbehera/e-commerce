import product from "../models/product.js";

const productLimit = async (req, res, next) => {
    try {
        const sellerId = req.params._id //Getting seller id
        const fifteenDays = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        const productCount = await product.countDocuments({ //Returns the number of documents posted
            seller: sellerId,
            createdAt: { $gte: fifteenDays }
        })
        if (productCount >= 5) {
            return res.status(403).json({ message: 'Product post limit is reached.' })
        }
        next()
    } catch (e) {
        return res.status(500).json({ message: 'Server is down.Please Wait.' })
    }
}

export default productLimit