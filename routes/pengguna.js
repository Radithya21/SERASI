// routes/pengguna.js
const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');

// Daftar semua pengguna
router.get('/', penggunaController.getPengguna);

// Tampilkan form tambah pengguna
router.get('/add', penggunaController.addPenggunaForm);
// Proses tambah pengguna
router.post('/add', penggunaController.createPengguna);

// Tampilkan form edit pengguna
router.get('/edit/:id', penggunaController.editPenggunaForm);
// Proses update pengguna
router.post('/edit/:id', penggunaController.updatePengguna);

// Proses hapus pengguna
router.post('/delete/:id', penggunaController.deletePengguna); // Gunakan POST untuk delete

// Lihat statistik kehadiran pengguna
router.get('/stats', penggunaController.getAttendanceStats);

module.exports = router;