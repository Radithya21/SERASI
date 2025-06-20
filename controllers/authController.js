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

        // Simpan id pengguna dan role ke dalam session
        req.session.userId = user.id_pengguna;  // Menyimpan ID pengguna di session
        req.session.role = user.role;            // Menyimpan role pengguna (admin/user) di session

        console.log('Login - userId:', user.id_pengguna, 'role:', user.role); // Log userId dan role

        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                req.flash('error', 'Terjadi kesalahan saat login.');
                return res.redirect('/login');
            }

            // Redirect berdasarkan role pengguna
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');  // Jika admin, arahkan ke dashboard admin
            } else if (user.role === 'user') {
                res.redirect('/dashboard');       // Jika user, arahkan ke dashboard user
            } else {
                req.flash('error', 'Role tidak valid.');
                res.redirect('/login');
            }
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
