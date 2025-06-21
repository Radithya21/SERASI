// routes/notulensiRoutes.js
const express = require('express');
const router = express.Router();
const notulensiController = require('../controllers/notulensiController');

// Daftar Notulensi (main view)
router.get('/', notulensiController.getDaftarNotulensi);

// Form Notulensi baru
router.get('/form', notulensiController.showFormCreateNotulensi);

// Simpan Notulensi baru
router.post('/new', notulensiController.createNotulensi);

// Detail Notulensi
router.get('/detail/:id', notulensiController.getDetailNotulensi);

// Form edit Notulensi
router.get('/edit/:id', notulensiController.showFormEditNotulensi);

// Update Notulensi
router.post('/edit/:id', notulensiController.updateNotulensi);

// Hapus Notulensi
router.post('/delete/:id', notulensiController.deleteNotulensi);

// Daftar Draft Notulensi
router.get('/drafts', notulensiController.getDraftNotulensi);

// Ekspor Notulensi
router.get('/export/:id', notulensiController.exportNotulensi);

module.exports = router;

