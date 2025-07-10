import product from "../models/product";

//Create Product ==>
export const createProduct = async (req, res) => {
    try {
        const { productName, description, price, category } = req.body
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
    const productId = req.params.id
    const sellerId = req.params._id
    const { productName, description, price, category } = req.body
    try {
        const existingProduct = await product.findOne({
            _id: productId,
            seller: sellerId
        })
        if (!existingProduct) {
            res.status(404).json({ message: 'This product does not exist.' })
        }
        product.name = productName || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        product.price = price || product.price;

        const updatedProduct = await product.save()
        res.status(202).json({ message: 'Successfully product updated.', data: updatedProduct })
    } catch (e) {
        res.status(500).json({ message: 'Server Error in updating the product.' })
    }
}

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
        res.status(202).json({ message: 'Successfully deleted product ', data: product })
    }
    catch (e) {
        console.log(e)
        res.status(502).json({ message: 'Server Error in deleting the product.' })
    }
}