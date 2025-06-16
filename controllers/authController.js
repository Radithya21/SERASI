const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Render login page
exports.loginPage = (req, res) => {
    res.render('auth/login', { title: 'Login', error: req.flash('error') });
};

// Handle login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.pengguna.findUnique({ where: { email } });
        console.log('Login - user:', user); // Log seluruh objek user untuk debug
        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.flash('error', 'Email atau password salah.');
            return res.redirect('/login');
        }

        req.session.userId = user.id_pengguna; // Gunakan id_pengguna sebagai userId
        req.session.role = user.role;

        console.log('Login - userId:', user.id_pengguna, 'role:', user.role); // Log userId dan role
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                req.flash('error', 'Terjadi kesalahan saat login.');
                return res.redirect('/login');
            }
            res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        });
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Terjadi kesalahan saat login.');
        res.redirect('/login');
    }
};

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};
