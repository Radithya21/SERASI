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

// Lihat detail pengguna
router.get('/detail/:id', penggunaController.detailPengguna);

// Ekspor daftar pengguna ke PDF
router.get('/export/pdf', penggunaController.exportPenggunaPDF);

// Halaman absensi
router.get('/absensi/:id', penggunaController.getAbsensiPage);
// Proses simpan data absensi
router.post('/absensi/:id', penggunaController.saveAbsensi);
// Ekspor data absensi
router.get('/exportAbsensi/:id', penggunaController.exportAbsensi);

module.exports = router;