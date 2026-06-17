const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

let realPool = null;
let useMock = false;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.warn('⚠️ Database environment variables missing. Falling back to persistent in-memory JSON database.');
    useMock = true;
} else {
    try {
        realPool = mysql.createPool({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    } catch (err) {
        console.warn('⚠️ Failed to initialize MySQL pool. Falling back to persistent in-memory JSON database.', err.message);
        useMock = true;
    }
}

// Persistent Mock Database Engine
const storePath = path.join(__dirname, 'db_store.json');
let dbStore = {};

function loadStore() {
    try {
        if (fs.existsSync(storePath)) {
            const raw = fs.readFileSync(storePath, 'utf8');
            dbStore = JSON.parse(raw);
        } else {
            dbStore = {
                users: [], categories: [], products: [], orders: [], order_items: [], blog_posts: [], contact_messages: [], testimonials: []
            };
        }
    } catch (err) {
        console.error('Error loading mock database store:', err);
    }
}

function saveStore() {
    try {
        fs.writeFileSync(storePath, JSON.stringify(dbStore, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving mock database store:', err);
    }
}

loadStore();

// Query Parser and Router
function executeMock(query, params = []) {
    // Normalize query space and case
    const normalized = query.trim().replace(/\s+/g, ' ');
    const upper = normalized.toUpperCase();

    // 1. SELECT * FROM users WHERE email = ?
    if (upper.includes('SELECT * FROM USERS WHERE EMAIL = ?')) {
        const row = dbStore.users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
        return [row ? [row] : []];
    }
    // 2. INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)
    if (upper.includes('INSERT INTO USERS') && upper.includes('(NAME, EMAIL, PASSWORD, PHONE)')) {
        const id = dbStore.users.length > 0 ? Math.max(...dbStore.users.map(u => u.id)) + 1 : 1;
        const newUser = {
            id,
            name: params[0],
            email: params[1],
            password: params[2],
            phone: params[3] || null,
            role: 'user',
            created_at: new Date().toISOString()
        };
        dbStore.users.push(newUser);
        saveStore();
        return [{ insertId: id }];
    }
    // 3. SELECT id, name, email, role, phone FROM users WHERE id = ?
    if (upper.includes('SELECT ID, NAME, EMAIL, ROLE, PHONE FROM USERS WHERE ID = ?')) {
        const row = dbStore.users.find(u => u.id === parseInt(params[0]));
        return [row ? [row] : []];
    }
    // 4. SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"
    if (upper.includes('SELECT SUM(TOTAL_AMOUNT) AS TOTAL FROM ORDERS WHERE STATUS !=')) {
        const total = dbStore.orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        return [[{ total }]];
    }
    // 5. SELECT COUNT(*) as count FROM orders
    if (upper.includes('SELECT COUNT(*) AS COUNT FROM ORDERS')) {
        return [[{ count: dbStore.orders.length }]];
    }
    // 6. SELECT COUNT(*) as count FROM products
    if (upper.includes('SELECT COUNT(*) AS COUNT FROM PRODUCTS')) {
        return [[{ count: dbStore.products.length }]];
    }
    // 7. SELECT COUNT(*) as count FROM users WHERE role = "user"
    if (upper.includes('SELECT COUNT(*) AS COUNT FROM USERS WHERE ROLE =')) {
        const count = dbStore.users.filter(u => u.role === 'user').length;
        return [[{ count }]];
    }
    // 8. SELECT COUNT(*) as count FROM contact_messages WHERE is_read = FALSE
    if (upper.includes('SELECT COUNT(*) AS COUNT FROM CONTACT_MESSAGES WHERE IS_READ =')) {
        const count = dbStore.contact_messages.filter(m => !m.is_read).length;
        return [[{ count }]];
    }
    // 9. SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC
    if (upper.includes('FROM ORDERS O LEFT JOIN USERS U ON O.USER_ID = U.ID')) {
        const list = dbStore.orders.map(o => {
            const u = dbStore.users.find(user => user.id === o.user_id);
            return {
                ...o,
                customer_name: u ? u.name : 'Unknown Customer',
                customer_email: u ? u.email : 'N/A'
            };
        });
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 10. UPDATE orders SET status = ? WHERE id = ?
    if (upper.startsWith('UPDATE ORDERS SET STATUS = ? WHERE ID = ?')) {
        const ord = dbStore.orders.find(o => o.id === parseInt(params[1]));
        if (ord) {
            ord.status = params[0];
            saveStore();
        }
        return [{ affectedRows: ord ? 1 : 0 }];
    }
    // 11. SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC
    if (upper.includes('FROM PRODUCTS P LEFT JOIN CATEGORIES C') && upper.includes('ORDER BY P.CREATED_AT DESC')) {
        const list = dbStore.products.map(p => {
            const c = dbStore.categories.find(cat => cat.id === p.category_id);
            return { ...p, category_name: c ? c.name : 'Uncategorized' };
        });
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 12. INSERT INTO products (...) VALUES (...)
    if (upper.startsWith('INSERT INTO PRODUCTS')) {
        const id = dbStore.products.length > 0 ? Math.max(...dbStore.products.map(p => p.id)) + 1 : 1;
        const newProd = {
            id,
            name: params[0],
            slug: params[1],
            price: parseFloat(params[2]),
            original_price: params[3] ? parseFloat(params[3]) : null,
            stock: parseInt(params[4]),
            description: params[5],
            ingredients: params[6] || null,
            benefits: params[7] || null,
            offers: params[8] || null,
            image_url: params[9] || null,
            subtitle: params[10] || null,
            rating: parseFloat(params[11] || 4.5),
            tag: params[12] || null,
            category_id: parseInt(params[13]),
            is_active: !!params[14],
            is_featured: !!params[15],
            created_at: new Date().toISOString()
        };
        dbStore.products.push(newProd);
        saveStore();
        return [{ insertId: id }];
    }
    // 13. UPDATE products SET ... WHERE id = ?
    if (upper.startsWith('UPDATE PRODUCTS SET')) {
        const id = parseInt(params[params.length - 1]);
        const prod = dbStore.products.find(p => p.id === id);
        if (prod) {
            prod.name = params[0];
            prod.price = parseFloat(params[1]);
            prod.original_price = params[2] ? parseFloat(params[2]) : null;
            prod.stock = parseInt(params[3]);
            prod.description = params[4];
            prod.ingredients = params[5] || null;
            prod.benefits = params[6] || null;
            prod.offers = params[7] || null;
            prod.image_url = params[8] || null;
            prod.subtitle = params[9] || null;
            prod.rating = parseFloat(params[10] || 4.5);
            prod.tag = params[11] || null;
            prod.category_id = parseInt(params[12]);
            prod.is_active = !!params[13];
            prod.is_featured = !!params[14];
            saveStore();
        }
        return [{ affectedRows: prod ? 1 : 0 }];
    }
    // 14. DELETE FROM products WHERE id = ?
    if (upper.startsWith('DELETE FROM PRODUCTS WHERE ID = ?')) {
        const idx = dbStore.products.findIndex(p => p.id === parseInt(params[0]));
        if (idx !== -1) {
            dbStore.products.splice(idx, 1);
            saveStore();
        }
        return [{ affectedRows: idx !== -1 ? 1 : 0 }];
    }

    // 14.1. SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC
    if (upper.includes('SELECT ID, NAME, EMAIL, ROLE, PHONE, CREATED_AT FROM USERS ORDER BY CREATED_AT DESC')) {
        const list = dbStore.users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            created_at: u.created_at
        }));
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 14.2. UPDATE users SET role = ? WHERE id = ?
    if (upper.startsWith('UPDATE USERS SET ROLE = ? WHERE ID = ?')) {
        const u = dbStore.users.find(user => user.id === parseInt(params[1]));
        if (u) {
            u.role = params[0];
            saveStore();
        }
        return [{ affectedRows: u ? 1 : 0 }];
    }
    // 14.3. DELETE FROM users WHERE id = ?
    if (upper.startsWith('DELETE FROM USERS WHERE ID = ?')) {
        const idx = dbStore.users.findIndex(user => user.id === parseInt(params[0]));
        if (idx !== -1) {
            dbStore.users.splice(idx, 1);
            saveStore();
        }
        return [{ affectedRows: idx !== -1 ? 1 : 0 }];
    }
    // 15. SELECT b.*, u.name as author_name FROM blog_posts b LEFT JOIN users u ON b.author_id = u.id ORDER BY b.created_at DESC
    if (upper.includes('FROM BLOG_POSTS B LEFT JOIN USERS U') && upper.includes('ORDER BY B.CREATED_AT DESC')) {
        const list = dbStore.blog_posts.map(b => {
            const u = dbStore.users.find(user => user.id === b.author_id);
            return { ...b, author_name: u ? u.name : 'Admin' };
        });
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 16. INSERT INTO blog_posts (title, slug, content, featured_image, author_id, is_published) VALUES (?, ?, ?, ?, ?, ?)
    if (upper.startsWith('INSERT INTO BLOG_POSTS')) {
        const id = dbStore.blog_posts.length > 0 ? Math.max(...dbStore.blog_posts.map(b => b.id)) + 1 : 1;
        const newPost = {
            id,
            title: params[0],
            slug: params[1],
            content: params[2],
            featured_image: params[3] || null,
            author_id: parseInt(params[4]),
            is_published: !!params[5],
            created_at: new Date().toISOString()
        };
        dbStore.blog_posts.push(newPost);
        saveStore();
        return [{ insertId: id }];
    }
    // 17. UPDATE blog_posts SET title=?, content=?, featured_image=?, is_published=? WHERE id=?
    if (upper.startsWith('UPDATE BLOG_POSTS SET')) {
        const id = parseInt(params[4]);
        const post = dbStore.blog_posts.find(b => b.id === id);
        if (post) {
            post.title = params[0];
            post.content = params[1];
            post.featured_image = params[2] || null;
            post.is_published = !!params[3];
            saveStore();
        }
        return [{ affectedRows: post ? 1 : 0 }];
    }
    // 18. DELETE FROM blog_posts WHERE id = ?
    if (upper.startsWith('DELETE FROM BLOG_POSTS WHERE ID = ?')) {
        const idx = dbStore.blog_posts.findIndex(b => b.id === parseInt(params[0]));
        if (idx !== -1) {
            dbStore.blog_posts.splice(idx, 1);
            saveStore();
        }
        return [{ affectedRows: idx !== -1 ? 1 : 0 }];
    }
    // 19. SELECT * FROM contact_messages ORDER BY is_read ASC, created_at DESC
    if (upper.includes('FROM CONTACT_MESSAGES ORDER BY IS_READ ASC')) {
        const list = [...dbStore.contact_messages];
        list.sort((a, b) => {
            if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
        return [list];
    }
    // 20. UPDATE contact_messages SET is_read = TRUE WHERE id = ?
    if (upper.startsWith('UPDATE CONTACT_MESSAGES SET IS_READ = TRUE WHERE ID = ?')) {
        const msg = dbStore.contact_messages.find(m => m.id === parseInt(params[0]));
        if (msg) {
            msg.is_read = true;
            saveStore();
        }
        return [{ affectedRows: msg ? 1 : 0 }];
    }
    // 21. SELECT * FROM testimonials ORDER BY created_at DESC
    if (upper.includes('FROM TESTIMONIALS ORDER BY CREATED_AT DESC') && !upper.includes('IS_ACTIVE = TRUE')) {
        const list = [...dbStore.testimonials];
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 22. INSERT INTO testimonials (customer_name, video_url, rating, caption, is_active) VALUES (?, ?, ?, ?, ?)
    if (upper.startsWith('INSERT INTO TESTIMONIALS')) {
        const id = dbStore.testimonials.length > 0 ? Math.max(...dbStore.testimonials.map(t => t.id)) + 1 : 1;
        const newTest = {
            id,
            customer_name: params[0],
            video_url: params[1] || null,
            rating: parseInt(params[2] || 5),
            caption: params[3] || null,
            is_active: !!params[4],
            created_at: new Date().toISOString()
        };
        dbStore.testimonials.push(newTest);
        saveStore();
        return [{ insertId: id }];
    }
    // 23. UPDATE testimonials SET customer_name=?, video_url=?, rating=?, caption=?, is_active=? WHERE id=?
    if (upper.startsWith('UPDATE TESTIMONIALS SET')) {
        const id = parseInt(params[5]);
        const test = dbStore.testimonials.find(t => t.id === id);
        if (test) {
            test.customer_name = params[0];
            test.video_url = params[1] || null;
            test.rating = parseInt(params[2] || 5);
            test.caption = params[3] || null;
            test.is_active = !!params[4];
            saveStore();
        }
        return [{ affectedRows: test ? 1 : 0 }];
    }
    // 24. DELETE FROM testimonials WHERE id = ?
    if (upper.startsWith('DELETE FROM TESTIMONIALS WHERE ID = ?')) {
        const idx = dbStore.testimonials.findIndex(t => t.id === parseInt(params[0]));
        if (idx !== -1) {
            dbStore.testimonials.splice(idx, 1);
            saveStore();
        }
        return [{ affectedRows: idx !== -1 ? 1 : 0 }];
    }
    // 25. SELECT * FROM categories ORDER BY name
    if (upper.includes('FROM CATEGORIES ORDER BY NAME')) {
        const list = [...dbStore.categories];
        list.sort((a, b) => a.name.localeCompare(b.name));
        return [list];
    }
    // 26. SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = TRUE
    if (upper.includes('FROM PRODUCTS P LEFT JOIN CATEGORIES C') && upper.includes('WHERE P.IS_ACTIVE = TRUE') && !upper.includes('SLUG = ?')) {
        const list = dbStore.products
            .filter(p => p.is_active)
            .map(p => {
                const c = dbStore.categories.find(cat => cat.id === p.category_id);
                return { ...p, category_name: c ? c.name : 'Uncategorized' };
            });
        return [list];
    }
    // 27. SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = TRUE
    if (upper.includes('FROM PRODUCTS P LEFT JOIN CATEGORIES C') && upper.includes('WHERE P.SLUG = ? AND P.IS_ACTIVE = TRUE')) {
        const p = dbStore.products.find(prod => prod.slug === params[0] && prod.is_active);
        if (p) {
            const c = dbStore.categories.find(cat => cat.id === p.category_id);
            return [[{ ...p, category_name: c ? c.name : 'Uncategorized' }]];
        }
        return [[]];
    }
    // 28. INSERT INTO orders (user_id, total_amount, address_line1, city, state, zip, phone) VALUES (?, ?, ?, ?, ?, ?, ?)
    if (upper.startsWith('INSERT INTO ORDERS') && !upper.includes('PAYMENT_ID')) {
        const id = dbStore.orders.length > 0 ? Math.max(...dbStore.orders.map(o => o.id)) + 1 : 1;
        const newOrder = {
            id,
            user_id: parseInt(params[0]),
            total_amount: parseFloat(params[1]),
            status: 'pending',
            payment_id: null,
            razorpay_order_id: null,
            address_line1: params[2],
            city: params[3],
            state: params[4],
            zip: params[5],
            phone: params[6],
            created_at: new Date().toISOString()
        };
        dbStore.orders.push(newOrder);
        saveStore();
        return [{ insertId: id }];
    }
    // 29. INSERT INTO order_items (order_id, product_id, price, quantity) VALUES (?, ?, ?, ?)
    if (upper.startsWith('INSERT INTO ORDER_ITEMS')) {
        const id = dbStore.order_items.length > 0 ? Math.max(...dbStore.order_items.map(oi => oi.id)) + 1 : 1;
        const newItem = {
            id,
            order_id: parseInt(params[0]),
            product_id: parseInt(params[1]),
            price: parseFloat(params[2]),
            quantity: parseInt(params[3])
        };
        dbStore.order_items.push(newItem);
        saveStore();
        return [{ insertId: id }];
    }
    // 30. SELECT * FROM orders WHERE id = ? AND user_id = ?
    if (upper.includes('SELECT * FROM ORDERS WHERE ID = ? AND USER_ID = ?')) {
        const ord = dbStore.orders.find(o => o.id === parseInt(params[0]) && o.user_id === parseInt(params[1]));
        return [ord ? [ord] : []];
    }
    // 31. SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
    if (upper.includes('FROM ORDER_ITEMS OI JOIN PRODUCTS P ON OI.PRODUCT_ID = P.ID WHERE OI.ORDER_ID = ?')) {
        const list = dbStore.order_items
            .filter(oi => oi.order_id === parseInt(params[0]))
            .map(oi => {
                const prod = dbStore.products.find(p => p.id === oi.product_id);
                return {
                    ...oi,
                    name: prod ? prod.name : 'Unknown Product',
                    image_url: prod ? prod.image_url : ''
                };
            });
        return [list];
    }
    // 32. INSERT INTO orders (user_id, total_amount, status, payment_id, razorpay_order_id, address_line1, city, state, zip, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    if (upper.startsWith('INSERT INTO ORDERS') && upper.includes('PAYMENT_ID')) {
        const id = dbStore.orders.length > 0 ? Math.max(...dbStore.orders.map(o => o.id)) + 1 : 1;
        const newOrder = {
            id,
            user_id: parseInt(params[0]),
            total_amount: parseFloat(params[1]),
            status: params[2],
            payment_id: params[3],
            razorpay_order_id: params[4],
            address_line1: params[5],
            city: params[6],
            state: params[7],
            zip: params[8],
            phone: params[9],
            created_at: new Date().toISOString()
        };
        dbStore.orders.push(newOrder);
        saveStore();
        return [{ insertId: id }];
    }
    // 33. SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    if (upper.includes('SELECT * FROM ORDERS WHERE USER_ID = ? ORDER BY CREATED_AT DESC')) {
        const list = dbStore.orders.filter(o => o.user_id === parseInt(params[0]));
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 34. SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY created_at DESC
    if (upper.includes('FROM TESTIMONIALS WHERE IS_ACTIVE = TRUE ORDER BY CREATED_AT DESC')) {
        const list = dbStore.testimonials.filter(t => t.is_active);
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 35. SELECT b.*, u.name as author_name FROM blog_posts b LEFT JOIN users u ON b.author_id = u.id WHERE b.is_published = TRUE ORDER BY b.created_at DESC
    if (upper.includes('FROM BLOG_POSTS B LEFT JOIN USERS U') && upper.includes('WHERE B.IS_PUBLISHED = TRUE ORDER BY B.CREATED_AT DESC')) {
        const list = dbStore.blog_posts
            .filter(b => b.is_published)
            .map(b => {
                const u = dbStore.users.find(user => user.id === b.author_id);
                return { ...b, author_name: u ? u.name : 'Admin' };
            });
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return [list];
    }
    // 36. SELECT b.*, u.name as author_name FROM blog_posts b LEFT JOIN users u ON b.author_id = u.id WHERE b.slug = ? AND b.is_published = TRUE
    if (upper.includes('FROM BLOG_POSTS B LEFT JOIN USERS U') && upper.includes('WHERE B.SLUG = ? AND B.IS_PUBLISHED = TRUE')) {
        const b = dbStore.blog_posts.find(post => post.slug === params[0] && post.is_published);
        if (b) {
            const u = dbStore.users.find(user => user.id === b.author_id);
            return [[{ ...b, author_name: u ? u.name : 'Admin' }]];
        }
        return [[]];
    }
    // 37. INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)
    if (upper.startsWith('INSERT INTO CONTACT_MESSAGES')) {
        const id = dbStore.contact_messages.length > 0 ? Math.max(...dbStore.contact_messages.map(m => m.id)) + 1 : 1;
        const newMsg = {
            id,
            name: params[0],
            email: params[1],
            phone: params[2] || null,
            subject: params[3] || 'General Inquiry',
            message: params[4],
            is_read: false,
            created_at: new Date().toISOString()
        };
        dbStore.contact_messages.push(newMsg);
        saveStore();
        return [{ insertId: id }];
    }

    console.warn('⚠️ Mock DB Unhandled Query:', query, params);
    return [[], {}];
}

// Wrapper interface mimicking mysql2 pool
const poolWrapper = {
    async execute(query, params) {
        if (useMock) {
            return executeMock(query, params);
        }
        try {
            return await realPool.execute(query, params);
        } catch (err) {
            console.error('MySQL execute error, trying mock fallback:', err.message);
            useMock = true;
            return executeMock(query, params);
        }
    },
    async query(query, params) {
        if (useMock) {
            return executeMock(query, params);
        }
        try {
            return await realPool.query(query, params);
        } catch (err) {
            console.error('MySQL query error, trying mock fallback:', err.message);
            useMock = true;
            return executeMock(query, params);
        }
    },
    async getConnection() {
        if (useMock) {
            return {
                execute: async (q, p) => executeMock(q, p),
                query: async (q, p) => executeMock(q, p),
                beginTransaction: async () => {},
                commit: async () => {},
                rollback: async () => {},
                release: () => {}
            };
        }
        try {
            const conn = await realPool.getConnection();
            return conn;
        } catch (err) {
            console.error('MySQL getConnection error, falling back to mock:', err.message);
            useMock = true;
            return {
                execute: async (q, p) => executeMock(q, p),
                query: async (q, p) => executeMock(q, p),
                beginTransaction: async () => {},
                commit: async () => {},
                rollback: async () => {},
                release: () => {}
            };
        }
    }
};

// Test database connection asynchronously on startup
if (realPool) {
    realPool.query('SELECT 1').then(() => {
        console.log('✅ MySQL Database connected successfully.');
    }).catch(err => {
        console.warn('⚠️ MySQL Database connection failed. Falling back to persistent in-memory JSON database.', err.message);
        useMock = true;
    });
}

module.exports = poolWrapper;
