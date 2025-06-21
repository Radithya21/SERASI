// routes/rapat.js
const express = require('express');
const router = express.Router();
const rapatController = require('../controllers/rapatController');
const authMiddleware = require('../middleware/authMiddleware'); // Impor middleware

// Daftar rapat
router.get('/', authMiddleware.isAuthenticated, rapatController.getDaftarRapat);

// Form rapat baru
router.get('/new', authMiddleware.isAuthenticated, rapatController.showFormCreateRapat);

// Simpan rapat baru
router.post('/new', authMiddleware.isAuthenticated, rapatController.createRapat);

// Detail rapat
router.get('/detail/:id', authMiddleware.isAuthenticated, rapatController.getDetailRapat);

// Menampilkan formulir edit rapat
router.get('/edit/:id', rapatController.getEditRapat);

// Menangani pembaruan rapat
router.post('/edit/:id', rapatController.updateRapat);

// Route untuk daftar rapat yang akan datang
router.get('/jadwal', rapatController.getUpcomingRapat);

// R    oute untuk menghapus rapat
router.post('/delete/:id', authMiddleware.isAuthenticated, rapatController.deleteRapat);

// Route untuk menampilkan riwayat rapat
router.get('/riwayat', authMiddleware.isAuthenticated, rapatController.getRiwayatRapat);

// Route untuk ekspor riwayat rapat ke PDF
router.get('/riwayat/pdf', authMiddleware.isAuthenticated, rapatController.exportRiwayatToPDF);

// Route untuk halaman absensi
router.get('/absensi/:id', authMiddleware.isAuthenticated, rapatController.getAbsensiPage);

// Route untuk ekspor daftar rapat yang akan datang ke PDF
router.get('/export/upcoming/rapat/pdf', authMiddleware.isAuthenticated, rapatController.exportUpcomingRapatToPDF);



module.exports = router;