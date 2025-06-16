// controllers/penggunaController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Untuk hashing password

// Lihat daftar semua pengguna/peserta
exports.getPengguna = async (req, res, next) => {
    try {
        const pengguna = await prisma.pengguna.findMany({
            orderBy: { nama: 'asc' }
        });
        console.log('getPengguna - pengguna:', pengguna); // Log data pengguna untuk debug
        res.render('admin/list', { title: 'Daftar Pengguna', pengguna });
    } catch (error) {
        console.error("Error fetching pengguna:", error);
        req.flash('error', 'Gagal memuat daftar pengguna.'); // Tambahkan flash error untuk fetching
        next(error);
    }
};

// Tampilkan form tambah pengguna baru
exports.addPenggunaForm = (req, res) => {
    // Ketika menampilkan form, kita bisa mengirim formData kosong atau default
    res.render('admin/new', { title: 'Tambah Pengguna Baru', formData: {} }); // <--- PERUBAHAN
};

// Proses tambah pengguna baru
exports.createPengguna = async (req, res, next) => {
    const { nama, email, password, role, nip, jabatan, departemen, telepon, status } = req.body;
    try {
        // Hashing password sebelum menyimpan
        const hashedPassword = await bcrypt.hash(password, 10); // Salt round 10

        await prisma.pengguna.create({
            data: {
                nama,
                email,
                password: hashedPassword,
                role: role || 'admin', // Default 'admin' jika tidak disediakan
                nip: nip || null,
                telepon: telepon || null,
            }
        });
        req.flash('success', 'Pengguna berhasil ditambahkan!');
        res.redirect('/admin/list');
    } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            req.flash('error', 'Email sudah terdaftar. Gunakan email lain.');
            // Tidak perlu mengirim 'error' sebagai variabel terpisah ke render
            return res.render('admin/new', {
                title: 'Tambah Pengguna Baru',
                formData: req.body // Tetap kirim formData agar input terisi kembali
                // HAPUS: error: 'Email sudah terdaftar. Gunakan email lain.'
            });
        }
        console.error("Error creating pengguna:", error);
        req.flash('error', 'Gagal menambahkan pengguna. Silakan coba lagi.'); // Tambahkan flash error generik
        // Untuk error yang tidak terduga, mungkin lebih baik redirect atau render ulang dengan data form
        res.redirect('/admin/new'); // <--- PERUBAHAN: Redirect ke form tambah
    }
};

// Tampilkan form edit pengguna
exports.editPenggunaForm = async (req, res, next) => {
    const { id } = req.params;
    try {
        const pengguna = await prisma.pengguna.findUnique({
            where: { id_pengguna: parseInt(id) }
        });
        if (!pengguna) {
            req.flash('error', 'Pengguna tidak ditemukan.');
            return res.status(404).redirect('/admin/list');
        }
        console.log('editPenggunaForm - pengguna:', pengguna); // Log data pengguna untuk debug
        res.render('admin/edit', { title: 'Edit Pengguna', pengguna });
    } catch (error) {
        console.error("Error fetching pengguna for edit:", error);
        req.flash('error', 'Gagal memuat data pengguna untuk diedit.'); // Tambahkan flash error
        res.redirect('/admin/list'); // <--- PERUBAHAN: Redirect jika ada error
    }
};

// Proses update pengguna
exports.updatePengguna = async (req, res, next) => {
    const { id } = req.params;
    const { nama, email, password, role, nip, jabatan, departemen, telepon, status } = req.body;
    try {
        let updateData = {
            nama,
            email,
            role,
            nip: nip || null,
            jabatan: jabatan || null,
            departemen: departemen || null,
            telepon: telepon || null,
            status
        };

        // Hanya update password jika disediakan (tidak kosong)
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.pengguna.update({
            where: { id_pengguna: parseInt(id) },
            data: updateData
        });
        req.flash('success', 'Pengguna berhasil diperbarui!');
        res.redirect('/admin/list');
    } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            req.flash('error', 'Email sudah terdaftar. Gunakan email lain.');
            const pengguna = await prisma.pengguna.findUnique({ where: { id_pengguna: parseInt(id) } }); // Tetap ambil pengguna
            // Tidak perlu mengirim 'error' sebagai variabel terpisah ke render
            return res.render('admin/edit', {
                title: 'Edit Pengguna',
                pengguna // Mengirim kembali data pengguna asli
                // HAPUS: error: 'Email sudah terdaftar. Gunakan email lain.'
            });
        }
        console.error("Error updating pengguna:", error);
        req.flash('error', 'Gagal memperbarui pengguna. Silakan coba lagi.'); // Tambahkan flash error generik
        res.redirect(`/admin/edit/${id}`); // <--- PERUBAHAN: Redirect ke form edit jika ada error
    }
};

// Proses hapus pengguna
exports.deletePengguna = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.pengguna.delete({
            where: { id_pengguna: parseInt(id) }
        });
        req.flash('success', 'Pengguna berhasil dihapus!');
        res.redirect('/admin/list');
    } catch (error) {
        console.error("Error deleting pengguna:", error);
        req.flash('error', 'Gagal menghapus pengguna. Mungkin ada data terkait.');
        next(error); // Tetap next(error) untuk penanganan error global jika diperlukan
    }
};

// Lihat statistik kehadiran peserta
exports.getAttendanceStats = async (req, res, next) => {
    try {
        const attendanceStats = await prisma.pengguna.findMany({
            include: {
                peserta_rapat: true
            },
            orderBy: { nama: 'asc' }
        });

        // Hitung jumlah kehadiran dengan kondisi 'hadir'
        const stats = attendanceStats.map(stat => ({
            id_pengguna: stat.id_pengguna,
            nama: stat.nama,
            email: stat.email,
            totalHadir: stat.peserta_rapat.filter(peserta => peserta.status_kehadiran === 'hadir').length
        }));

        res.render('admin/stats', { title: 'Statistik Kehadiran Peserta', attendanceStats: stats });
    } catch (error) {
        console.error("Error fetching attendance stats:", error);
        req.flash('error', 'Gagal memuat statistik kehadiran.'); // Tambahkan flash error
        next(error);
    }
};