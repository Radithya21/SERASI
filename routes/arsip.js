// routes/arsip.js
const express = require('express');
const router = express.Router();
const arsipController = require('../controllers/arsipController');

// Menampilkan daftar arsip rapat
router.get('/', arsipController.getArsipRapat);

module.exports = router;