import product from "../models/product.js";
import order from "../models/order.js";

//Dashboard of Seller
export const sellerDashboard = async (req, res) => {
    const sellerId = req.params._id
    try {
        const totalProducts = await product.countDocuments({ seller: sellerId }) //Counts all products of a seller
        const totalOrders = await order.countDocuments({ seller: sellerId }) //Counts all orders from the seller by _id
        const pendingOrders = await order.countDocuments({ seller: sellerId, status: 'pending' }) //Status of the order 
        //Top products
        const topProducts = await order.aggregate([
            { $match: { seller: sellerId } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    totalSold: { $sum: 'orderItems.quantity' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }

        ])  
        const topCategories = await product.aggregate([
            { $match: { seller: sellerId } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        res.status(200).json({
            totalProducts,
            totalOrders,
            pendingOrders,
            topProducts,
            topCategories
        });
    }
    catch (e) {
        return res.status(500).json({ message: "Dashboard Server is down." })
    }
}

//Create Product ==>
export const createProduct = async (req, res) => {
    try {
        console.log(req.body)
        const { productName, description, price, category } = req.body
        console.log('new')
        const imagePath = req.file ? req.file.path : null
        const newProduct = new product({
            productName,
            description,
            price,
            category,
            image: imagePath
        })
        await newProduct.save()
        res.status(201).json({ message: 'Successfully product created.' })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Server Error in creating the product.' })
    }
}

//Update Product ==>
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params; 
        const { productName, description, category, price } = req.body;

        const existingProduct = await product.findOne({ productId });
       

        if (!existingProduct) {
            return res.status(404).json({ message: 'This product does not exist.' });
        }
        console.log('1')

        existingProduct.productName = productName || existingProduct.productName;
        existingProduct.description = description || existingProduct.description;
        existingProduct.category = category || existingProduct.category;
        existingProduct.price = price || existingProduct.price;
        console.log('2')

        const updatedProduct = await existingProduct.save();
        console.log('3')

        return res.status(200).json({
            message: 'Product updated successfully.',
            product: updatedProduct
        });
        
    } catch (e) {
        console.log('Update Error:', e)
        console.error('Update Error:', e);
        if (res.headersSent) return;
        return res.status(500).json({ message: 'Server error while updating product.' });
    }
};



//Delete Product ==>
export const deleteProduct = async (req, res) => {
    const productId = req.params.id
    const sellerId = req.params._id
    await product.findOneAndDelete({
        _id: productId,
        seller: sellerId
    })
    try {
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }
        res.status(202).json({ message: 'Successfully deleted product.', data: product })
    }
    catch (e) {
        console.log(e)
        res.status(502).json({ message: 'Server Error in deleting the product.' })
    }
}

//Get orders ==>
export const getOrders = async (req, res) => {
    try {
        const orders = await order.find({ seller: req.user._id })
            .populate('customer', 'username')
            .populate('orderItems.product', 'name')
        res.status(200).json({ orders })
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Order fetch error.' })
    }
}
//Get pending orders ==>
export const getPendingOrders=async(req,res)=>{
    try{
        const orders=await order.find({seller:req.user._id,status:'pending'})
        res.status(200).json({orders})
    }
    catch(e){
        return res.status(500).json({message:'Pending order fetch error.'})
    }
}
//Get Delivered orders ==>
export const getDeliveredOrders=async(req,res)=>{
    try{
        const orders=await order.find({seller:req.user._id,status:'delivered'})
        res.status(200).json({orders})
    }
    catch(e){
        console.log(e)
        return res.status(500).json({message:'Delivered order fetch error.'})
    }
}    