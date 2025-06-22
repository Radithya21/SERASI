// routes/arsip.js
const express = require('express');
const router = express.Router();
const arsipController = require('../controllers/arsipController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Terapkan middleware autentikasi ke semua route
router.use(isAuthenticated);

// Menampilkan daftar arsip rapat
router.get('/', arsipController.getArsipRapat);

module.exports = router;