const express = require('express');
const router = express.Router();
const { getBlogPosts, getPostBySlug } = require('../controllers/blogController');

router.get('/', getBlogPosts);
router.get('/:slug', getPostBySlug);

module.exports = router;
