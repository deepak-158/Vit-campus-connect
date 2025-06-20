const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Create a new request (hostellers only)
router.post('/', auth, checkRole(['hosteller']), requestController.createRequest);

// Get all requests (day scholars only)
router.get('/', auth, checkRole(['dayscholar', 'admin']), requestController.getAllRequests);

// Get my requests (hostellers only)
router.get('/my-requests', auth, checkRole(['hosteller']), requestController.getMyRequests);

// Get my deliveries (day scholars only)
router.get('/my-deliveries', auth, checkRole(['dayscholar']), requestController.getMyDeliveries);

// Get request by ID
router.get('/:id', auth, requestController.getRequestById);

// Accept a request (day scholars only)
router.put('/:id/accept', auth, checkRole(['dayscholar']), requestController.acceptRequest);

// Mark request as delivered (day scholars only)
router.put('/:id/deliver', auth, checkRole(['dayscholar']), requestController.markDelivered);

// Confirm delivery (hostellers only)
router.put('/:id/confirm', auth, checkRole(['hosteller']), requestController.confirmDelivery);

// Cancel request (hostellers only)
router.put('/:id/cancel', auth, checkRole(['hosteller']), requestController.cancelRequest);

// Cancel delivery (day scholars only)
router.put('/:id/cancel-delivery', auth, checkRole(['dayscholar']), requestController.cancelDelivery);

module.exports = router;
