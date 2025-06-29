// routes/pengguna.js
const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Terapkan middleware autentikasi ke semua route
router.use(isAuthenticated);

// Dashboard pengguna (bukan daftar pengguna untuk admin)
router.get('/', penggunaController.getDashboard);

// Daftar semua pengguna (untuk admin) - pindah ke route yang lebih spesifik
router.get('/list', penggunaController.getPengguna);

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
router.get('/stats', penggunaController.getStatistikaPage);

// Lihat detail pengguna
router.get('/detail/:id', penggunaController.detailPengguna);

// Halaman absensi
router.get('/absensi/:id', penggunaController.getAbsensiPage);
// Proses simpan data absensi
router.post('/absensi/:id', penggunaController.saveAbsensi);
// Ekspor data absensi
router.get('/exportAbsensi/:id', penggunaController.exportAbsensi);

// Rute untuk melihat jadwal rapat (hanya untuk user)
router.get('/jadwal', penggunaController.getUpcomingRapat);  // Menggunakan fungsi getUpcomingRapat untuk menampilkan jadwal rapat

// Rute untuk melihat riwayat rapat
router.get('/riwayat', penggunaController.getRiwayatRapat);  // Menampilkan riwayat rapat

// Lihat detail rapat
router.get('/details/:id', penggunaController.getDetailRapat);

// Lihat detail riwayat rapat (mengarah ke penggunaController.getDetailRiwayat)
router.get('/riwayat/detail/:id', penggunaController.getDetailRiwayat);

// Halaman dashboard pengguna
router.get('/dashboard', penggunaController.getDashboard);

// Halaman arsip notulensi untuk pengguna
router.get('/arsip', penggunaController.getArsipNotulensi);
// Detail arsip notulensi untuk pengguna (isi notulensi & dokumentasi di page terpisah)
router.get('/arsip/detail/:id', penggunaController.getDetailArsipNotulensi);
// Export/download notulensi beserta dokumentasi (PDF) dari halaman detail
router.get('/arsip/export/:id', penggunaController.exportArsipNotulensi);
// Halaman notulensi sebelumnya (khusus page baru)
router.get('/arsip/sebelumnya', penggunaController.getArsipNotulensiSebelumnya);

module.exports = router;