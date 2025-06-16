const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');

// Daftar rapat
router.get('/', rapatController.getDaftarRapat);

// Form rapat baru
router.get('/new', rapatController.showFormCreateRapat); // ✅ TAMBAHKAN INI

// Simpan rapat baru
router.post('/new', rapatController.createRapat);

// Detail rapat
router.get('/detail/:id', rapatController.getDetailRapat);

module.exports = router;
