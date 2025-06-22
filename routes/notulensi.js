// routes/notulensiRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const notulensiController = require('../controllers/notulensiController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Terapkan middleware autentikasi ke semua route
router.use(isAuthenticated);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/dokumentasi'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Daftar Notulensi (main view)
router.get('/', notulensiController.getDaftarNotulensi);

// Form Notulensi baru
router.get('/form', notulensiController.showFormCreateNotulensi);

// Simpan Notulensi baru
router.post('/new', upload.array('dokumentasi'), notulensiController.createNotulensi);

// Detail Notulensi
router.get('/detail/:id', notulensiController.getDetailNotulensi);

// Form edit Notulensi
router.get('/edit/:id', notulensiController.showFormEditNotulensi);

// Update Notulensi
router.post('/edit/:id', upload.array('dokumentasi'), notulensiController.updateNotulensi);

// Hapus Notulensi
router.post('/delete/:id', notulensiController.deleteNotulensi);

// Daftar Draft Notulensi
router.get('/drafts', notulensiController.getDraftNotulensi);

// Ekspor Notulensi
router.get('/export/:id', notulensiController.exportNotulensi);

module.exports = router;

