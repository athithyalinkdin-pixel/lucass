const pool = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { z } = require('zod');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('⚠️ Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing. Payment routes will be disabled.');
} else {
  razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, address_line1, city, state, zip, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, totalPrice, shippingAddress.address, shippingAddress.city, shippingAddress.state, shippingAddress.zip, shippingAddress.phone]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.price, item.qty]
            );
        }

        await connection.commit();
        res.status(201).json({ id: orderId, message: 'Order created successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    } finally {
        connection.release();
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        const order = orders[0];

        if (order) {
            const [items] = await pool.execute(`
                SELECT oi.*, p.name, p.image_url 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            order.orderItems = items;
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/payment/create
// @access  Private
const createRazorpayOrder = async (req, res) => {
    if (!razorpay) {
        return res.status(501).json({ success: false, message: 'Razorpay payment gateway is not configured on this server.' });
    }
    try {
        const options = {
            amount: req.body.amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    if (!RAZORPAY_KEY_SECRET) {
        return res.status(501).json({ success: false, message: 'Razorpay secret key is not configured on this server.' });
    }
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        shippingAddress,
        orderItems,
        totalPrice
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        // Payment verified, save order to DB
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [orderResult] = await connection.execute(
                'INSERT INTO orders (user_id, total_amount, status, payment_id, razorpay_order_id, address_line1, city, state, zip, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [req.user.id, totalPrice, 'paid', razorpay_payment_id, razorpay_order_id, shippingAddress.address, shippingAddress.city, shippingAddress.state, shippingAddress.zip, shippingAddress.phone]
            );

            const orderId = orderResult.insertId;

            for (const item of orderItems) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.price, item.qty]
                );
            }

            await connection.commit();
            res.status(200).json({ success: true, message: "Payment verified successfully", orderId });
        } catch (error) {
            await connection.rollback();
            console.error('Error:', error.message);
            res.status(500).json({ 
                success: false, 
                message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
            });
        } finally {
            connection.release();
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const [orders] = await pool.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(orders);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
        });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    createRazorpayOrder,
    verifyPayment,
    getMyOrders
};
