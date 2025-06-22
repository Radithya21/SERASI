const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Tambahkan ini
const penggunaController = require('../controllers/penggunaController'); // Kembalikan ke penggunaController

// Login routes
router.get('/login', authController.loginPage);
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Contoh penggunaan middleware
router.get('/admin/dashboard', authMiddleware.isAuthenticated, authMiddleware.isAdmin, (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

router.get('/pengguna/dashboard', authMiddleware.isAuthenticated, (req, res) => {
    res.render('pengguna/dashboard', { title: 'User Dashboard' });
});

// User management routes
router.get('/admin/edit/:id', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.editPenggunaForm);
router.post('/admin/edit/:id', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.updatePengguna);
router.get('/admin/new', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.addPenggunaForm);
router.post('/admin/new', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.createPengguna);
router.get('/admin/stats', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.getStatistikaPage);
router.get('/admin/list', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.getPengguna);
router.get('/admin/detail/:id', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.detailPengguna);
router.post('/admin/delete/:id', authMiddleware.isAuthenticated, authMiddleware.isAdmin, penggunaController.deletePengguna);

module.exports = router;
