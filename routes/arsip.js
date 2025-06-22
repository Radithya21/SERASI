const express = require('express');
const router = express.Router();
const arsipController = require('../controllers/arsipController'); // ✅ ini penting!

// ✅ Pastikan semua function ini ada dan diekspor dari arsipController
router.get('/', arsipController.getArsipRapat);
router.get('/detail/:id', arsipController.getDetailNotulensi);
router.get('/dokumentasi/:id', arsipController.getDokumentasi);
router.get('/export/:id', arsipController.exportPDF);
router.get('/sebelumnya', arsipController.getArsipNotulensiSebelumnya);

module.exports = router;
