const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draftController');

router.get('/', draftController.getDraftList);
router.get('/edit/:id', draftController.editNotulensiForm);
router.post('/edit/:id', draftController.updateNotulensi);
router.post('/upload/:id', draftController.uploadNotulensi);
router.post('/delete/:id', draftController.deleteNotulensi);

module.exports = router;
