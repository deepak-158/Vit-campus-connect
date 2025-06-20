const { Product, User, Notification } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  }
}).array('images', 5); // Allow up to 5 images

// Create a new product listing
exports.createProduct = async (req, res) => {
  try {
    // Only hostellers can create product listings
    if (req.user.role !== 'hosteller') {
      return res.status(403).json({ message: 'Only hostellers can list products for sale' });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { name, description, price, quantity, category, condition, isNegotiable } = req.body;
      
      // Process uploaded images
      const imageFiles = req.files || [];
      const images = imageFiles.map(file => `/uploads/products/${file.filename}`);

      const product = await Product.create({
        sellerId: req.user.id,
        name,
        description,
        price,
        quantity: quantity || 1,
        category: category || 'other',
        condition: condition || 'good',
        isNegotiable: isNegotiable === 'true',
        images,
        postedAt: new Date()
      });

      // Create notifications for other hostellers
      const hostellers = await User.findAll({
        where: { 
          role: 'hosteller', 
          isVerified: true,
          id: { [Op.ne]: req.user.id } // Exclude the seller
        }
      });

      for (const hosteller of hostellers) {
        await Notification.create({
          userId: hosteller.id,
          title: 'New Product Listing',
          message: `A new product "${name}" has been listed for sale.`,
          type: 'product',
          relatedId: product.id
        });
      }

      res.status(201).json({ 
        message: 'Product listed successfully', 
        product 
      });
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all products (with filters)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, condition, minPrice, maxPrice, search, sellerId, status } = req.query;
    
    // Only hostellers can view products
    if (req.user.role !== 'hosteller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const whereClause = {};
    
    // Filter by category
    if (category) whereClause.category = category;
    
    // Filter by condition
    if (condition) whereClause.condition = condition;
    
    // Filter by price range
    if (minPrice && maxPrice) {
      whereClause.price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice) {
      whereClause.price = { [Op.gte]: minPrice };
    } else if (maxPrice) {
      whereClause.price = { [Op.lte]: maxPrice };
    }
    
    // Filter by seller
    if (sellerId) whereClause.sellerId = sellerId;
    
    // Filter by status
    if (status) whereClause.status = status;
    
    // Filter by search term
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
      const products = await Product.findAll({
      where: whereClause,
      include: [        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email', 'avatar', 'hostelBlock', 'roomNumber', 'averageRating', 'createdAt']
        }
      ],
      order: [['postedAt', 'DESC']]
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my product listings
exports.getMyProducts = async (req, res) => {
  try {
    // Only hostellers can have product listings
    if (req.user.role !== 'hosteller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const products = await Product.findAll({
      where: { sellerId: req.user.id },
      order: [['postedAt', 'DESC']]
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;    const product = await Product.findByPk(id, {      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email', 'avatar', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating', 'createdAt']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only hostellers can view products
    if (req.user.role !== 'hosteller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product listing
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the seller of this product' });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { name, description, price, quantity, category, condition, isNegotiable, status } = req.body;
      
      // Process uploaded images
      const imageFiles = req.files || [];
      let images = product.images;
      
      if (imageFiles.length > 0) {
        // Remove old images if new ones are uploaded
        for (const imagePath of product.images) {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
        
        // Set new images
        images = imageFiles.map(file => `/uploads/products/${file.filename}`);
      }

      // Update product
      await product.update({
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        quantity: quantity || product.quantity,
        category: category || product.category,
        condition: condition || product.condition,
        isNegotiable: isNegotiable === 'true',
        status: status || product.status,
        images
      });

      res.status(200).json({ 
        message: 'Product updated successfully', 
        product 
      });
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark product as sold
exports.markAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the seller of this product' });
    }

    // Update product
    product.status = 'sold';
    await product.save();

    res.status(200).json({ 
      message: 'Product marked as sold', 
      product 
    });
  } catch (error) {
    console.error('Mark as sold error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product listing
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this product' });
    }

    // Delete associated images
    for (const imagePath of product.images) {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Delete product
    await product.destroy();

    res.status(200).json({ 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
