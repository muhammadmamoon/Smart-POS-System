const Product = require("../model/product.model");
const Category = require("../model/Category");
const generateBarcode = require("../utils/barcodeGenerator");

// 📌 SKU Generator
const generateSKU = (categoryName) => {
    const prefix = categoryName ? categoryName.substring(0, 3).toUpperCase() : "PRD";
    return `${prefix}-${Date.now()}`;
};

// 📌 Barcode Generator (Base64)
// const generateBarcode = async (text) => {
//     try {
//         const png = await bwipjs.toBuffer({
//             bcid: 'code128',
//             text: text,
//             scale: 3,
//             height: 10,
//             includetext: true,
//             textxalign: 'center',
//         });
//         return `data:image/png;base64,${png.toString("base64")}`;
//     } catch (err) {
//         console.error("Barcode generation error:", err);
//         return null;
//     }
// };

// 📌 Create Product
const createProduct = async (req, res) => {
    try {
        let products = req.body;

        // If single product is sent, wrap it in an array
        if (!Array.isArray(products)) {
            products = [products];
        }

        const createdProducts = [];

        for (const product of products) {
            const { productName, purchasePrice, sellingPrice, description, category, stock, imageUrl } = product;

            // Validate required fields
            if (!productName || !purchasePrice || !sellingPrice || !category || stock == null) {
                return res.status(400).json({ message: "Required fields are missing for product" });
            }

            // Check category exists
            const foundCategory = await Category.findById(category);
            if (!foundCategory) {
                return res.status(400).json({ message: `Invalid category for product: ${productName}` });
            }

            // Generate SKU & Barcode
            const sku = generateSKU(foundCategory.name);
            const barcodeImage = await generateBarcode(sku);

            // Create new product
            const newProduct = new Product({
                productName,
                purchasePrice,
                sellingPrice,
                description,
                category,
                stock,
                imageUrl,
                sku,
                barcodeImage
            });

            await newProduct.save();
            createdProducts.push(newProduct);
        }

        return res.status(201).json({
            message: `${createdProducts.length} product(s) added successfully`,
            products: createdProducts
        });
    } catch (error) {
        console.error("Error creating product(s):", error);
        return res.status(500).json({ message: "Server error" });
    }
};


// 📌 Get All Products
const getAllProducts = async (req, res) => {
    try {
        const allProducts = await Product.find().populate("category", "name");
        return res.status(200).json(allProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// 📌 Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // If category changed → regenerate SKU & Barcode
        if (category && category.toString() !== product.category.toString()) {
            const foundCategory = await Category.findById(category);
            if (!foundCategory) {
                return res.status(400).json({ message: "Invalid category" });
            }
            product.sku = generateSKU(foundCategory.name);
            product.barcodeImage = await generateBarcode(product.sku);
            product.category = category;
        }

        // Update other fields
        Object.assign(product, req.body);

        await product.save();

        return res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// 📌 Delete Single Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// 📌 Delete All Products
const deleteAllProducts = async (req, res) => {
    try {
        const result = await Product.deleteMany({});
        return res.status(200).json({
            message: "All products deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error deleting all products:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    deleteAllProducts
};
