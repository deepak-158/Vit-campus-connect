const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Create a new product listing (hostellers only)
router.post('/', auth, checkRole(['hosteller']), productController.createProduct);

// Get all products (hostellers only)
router.get('/', auth, checkRole(['hosteller', 'admin']), productController.getAllProducts);

// Get my product listings
router.get('/my-products', auth, checkRole(['hosteller']), productController.getMyProducts);

// Get product by ID
router.get('/:id', auth, productController.getProductById);

// Update product listing (owner only)
router.put('/:id', auth, checkRole(['hosteller']), productController.updateProduct);

// Mark product as sold (owner only)
router.put('/:id/sold', auth, checkRole(['hosteller']), productController.markAsSold);

// Delete product listing (owner or admin only)
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
