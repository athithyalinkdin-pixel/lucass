const express = require('express');
const router = express.Router();
const { 
    addOrderItems, 
    getOrderById, 
    createRazorpayOrder, 
    verifyPayment,
    getMyOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addOrderItems);
router.post('/payment/create', protect, createRazorpayOrder);
router.post('/payment/verify', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
