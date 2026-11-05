const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'my-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// In-Memory User Credentials
let usersDB = {
    'admin': 'admin123'
};

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
}

// HTML Serve Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (usersDB[username] && usersDB[username] === password) {
        req.session.user = { username };
        return res.json({ success: true, redirect: 'dashboard.html' });
    }
    return res.status(400).json({ success: false, message: 'Invalid Credentials' });
});

// Reset Password API
app.post('/api/reset-password', (req, res) => {
    const { username, newPassword } = req.body;

    if (usersDB[username]) {
        usersDB[username] = newPassword;
        return res.json({ success: true, message: 'Password updated successfully' });
    }
    return res.status(404).json({ success: false, message: 'Username not found' });
});

// Check Session API
app.get('/api/check-auth', isAuthenticated, (req, res) => {
    res.json({ loggedIn: true, user: req.session.user });
});

// Logout API
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});