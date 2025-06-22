// routes/rapat.js
const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');
const authMiddleware = require('../middleware/authMiddleware'); // Impor middleware

// Terapkan middleware autentikasi ke semua route
router.use(authMiddleware.isAuthenticated);

// Daftar rapat
router.get('/', rapatController.getDaftarRapat);

// Form rapat baru
router.get('/new', rapatController.showFormCreateRapat);

// Simpan rapat baru
router.post('/new', rapatController.createRapat);

// Detail rapat
router.get('/detail/:id', rapatController.getDetailRapat);

// Menampilkan formulir edit rapat
router.get('/edit/:id', rapatController.getEditRapat);

// Menangani pembaruan rapat
router.post('/edit/:id', rapatController.updateRapat);

// Route untuk daftar rapat yang akan datang
router.get('/jadwal', rapatController.getUpcomingRapat);

// Route untuk menghapus rapat
router.post('/delete/:id', rapatController.deleteRapat);

// Route untuk menampilkan riwayat rapat
router.get('/riwayat', rapatController.getRiwayatRapat);

// Route untuk ekspor riwayat rapat ke PDF
router.get('/riwayat/pdf', rapatController.exportRiwayatToPDF);

// Route untuk halaman absensi
router.get('/absensi/:id', rapatController.getAbsensiPage);

// Route untuk ekspor daftar rapat yang akan datang ke PDF

router.get('/export/upcoming/rapat/pdf', authMiddleware.isAuthenticated, rapatController.exportUpcomingRapatToPDF);

// Route untuk halaman statistik mingguan
router.get('/riwayat/statistik', authMiddleware.isAuthenticated, rapatController.getStatistikMingguan);


module.exports = router;