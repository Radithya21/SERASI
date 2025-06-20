// routes/rapat.js
const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');
const authMiddleware = require('../middleware/authMiddleware'); // Impor middleware

// Route untuk halaman absensi
router.get('/absensi/:id', authMiddleware.isAuthenticated, rapatController.getAbsensiPage);

module.exports = router;