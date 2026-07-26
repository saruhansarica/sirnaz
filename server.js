const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to extract session token from cookies (robust mapping that preserves base64 padding '=' characters)
const getAdminCookie = (req) => {
  if (!req.headers.cookie) return null;
  const prefix = 'sirnaz_admin_session=';
  const cookiePair = req.headers.cookie.split(';').map(c => c.trim()).find(row => row.startsWith(prefix));
  return cookiePair ? cookiePair.substring(prefix.length) : null;
};

// Configure Multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    // Generate clean file names with a timestamp to avoid name collisions
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    cb(null, `${baseName}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// Middleware to parse JSON bodies with size limit (for full menu uploads)
app.use(express.json({ limit: '10mb' }));

// Custom middleware to check admin authorization
app.use('/admin', (req, res, next) => {
  // Allow login.html to be accessed publicly
  if (req.path === '/login.html') {
    return next();
  }

  // Get session token
  const session = getAdminCookie(req);
  const expectedSession = Buffer.from('sirnaz:4S*rdx89.').toString('base64');

  if (session === expectedSession) {
    return next();
  }

  // If unauthorized and asking for document, redirect to login page
  if (req.path === '/' || req.path === '/index.html' || req.path === '') {
    return res.redirect('/admin/login.html');
  }

  // Otherwise, return 401 Unauthorized for assets or api
  return res.status(401).send('Unauthorized');
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Authentication API: Login Route
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'sirnaz' && password === '4S*rdx89.') {
    const sessionToken = Buffer.from('sirnaz:4S*rdx89.').toString('base64');
    // Set cookie, max age 1 day (86400 seconds)
    res.setHeader('Set-Cookie', `sirnaz_admin_session=${sessionToken}; Path=/; Max-Age=86400; SameSite=Strict`);
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı.' });
});

// Authentication API: Logout Route
app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'sirnaz_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ success: true });
});

// Protected API: Image Upload Route
app.post('/api/upload', (req, res, next) => {
  // Check session cookie
  const session = getAdminCookie(req);
  const expectedSession = Buffer.from('sirnaz:4S*rdx89.').toString('base64');
  if (session !== expectedSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const fileUrl = `/images/${req.file.filename}`;
  res.json({ success: true, imageUrl: fileUrl });
});

// API endpoint to retrieve the menu data
app.get('/api/menu', (req, res) => {
  const menuPath = path.join(__dirname, 'data', 'menu.json');
  
  fs.readFile(menuPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading menu data:', err);
      return res.status(500).json({ error: 'Failed to retrieve menu data.' });
    }
    try {
      const menu = JSON.parse(data);
      res.json(menu);
    } catch (parseErr) {
      console.error('Error parsing menu data:', parseErr);
      res.status(500).json({ error: 'Invalid menu data format.' });
    }
  });
});

// API endpoint to update the menu data (protected with cookie check)
app.post('/api/menu', (req, res) => {
  const session = getAdminCookie(req);
  const expectedSession = Buffer.from('sirnaz:4S*rdx89.').toString('base64');

  if (session !== expectedSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const menuPath = path.join(__dirname, 'data', 'menu.json');
  const newMenu = req.body;

  if (!Array.isArray(newMenu)) {
    return res.status(400).json({ error: 'Menu data must be a JSON array.' });
  }

  fs.writeFile(menuPath, JSON.stringify(newMenu, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing menu data:', err);
      return res.status(500).json({ error: 'Failed to save menu data.' });
    }
    res.json({ success: true, message: 'Menu data saved successfully.' });
  });
});

// Fallback to serve index.html for single page application behavior
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Şirnaz Ocakbaşı QR Menu Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
