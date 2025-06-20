// Middleware untuk memeriksa apakah pengguna sudah login
exports.isAuthenticated = (req, res, next) => {
    console.log('isAuthenticated - userId:', req.session.userId); // Log userId
    if (req.session.userId) {
        console.log('isAuthenticated - user is authenticated');
        return next();
    }
    console.log('isAuthenticated - user is not authenticated');
    req.flash('error', 'Anda harus login terlebih dahulu.');
    res.redirect('/login');
};

// Middleware untuk memeriksa apakah pengguna adalah admin
exports.isAdmin = (req, res, next) => {
    console.log('isAdmin - role:', req.session.role); // Log role
    if (req.session.role === 'admin') {
        console.log('isAdmin - user is admin');
        return next();
    }
    console.log('isAdmin - user is not admin');
    req.flash('error', 'Anda tidak memiliki akses ke halaman ini.');
    res.redirect('/');
};

exports.isUser = (req, res, next) => {
    console.log('isUser - role:', req.session.role); // Log role
    if (req.session.role === 'user') {
        console.log('isUser - user is admin');
        return next();
    }
    console.log('isAdmin - user is not admin');
    req.flash('error', 'Anda tidak memiliki akses ke halaman ini.');
    res.redirect('/');
};
