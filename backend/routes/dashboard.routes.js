const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Hosteller dashboard routes
router.get('/hosteller/stats', auth, checkRole(['hosteller']), dashboardController.getHostellerStats);
router.get('/hosteller/requests/recent', auth, checkRole(['hosteller']), dashboardController.getRecentRequests);
router.get('/hosteller/products/recent', auth, checkRole(['hosteller']), dashboardController.getRecentProducts);

// Dayscholar dashboard routes
router.get('/dayscholar/stats', auth, checkRole(['dayscholar']), dashboardController.getDayscholarStats);
router.get('/dayscholar/deliveries/active', auth, checkRole(['dayscholar']), dashboardController.getActiveDeliveries);
router.get('/dayscholar/requests/available', auth, checkRole(['dayscholar']), dashboardController.getAvailableRequests);

module.exports = router;
