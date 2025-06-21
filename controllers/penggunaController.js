// controllers/penggunaController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Untuk hashing password
const PDFDocument = require('pdfkit');

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
    const { nama, email, password, role, nip, telepon, } = req.body;
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
    const { nama, email, password, role, nip, telepon } = req.body;
    try {
        let updateData = {
            nama,
            email,
            role,
            nip: nip || null,
            telepon: telepon || null
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
        // Hapus data terkait di tabel peserta_Rapat
        await prisma.peserta_Rapat.deleteMany({
            where: { id_pengguna: parseInt(id) }
        });

        // Hapus data pengguna
        await prisma.pengguna.delete({
            where: { id_pengguna: parseInt(id) }
        });

        req.flash('success', 'Pengguna berhasil dihapus!');
        res.redirect('/admin/list');
    } catch (error) {
        console.error("Error deleting pengguna:", error);
        req.flash('error', 'Gagal menghapus pengguna. Mungkin ada data terkait.');
        next(error);
    }
};

// Detail pengguna
exports.detailPengguna = async (req, res, next) => {
    const { id } = req.params;
    try {
        const pengguna = await prisma.pengguna.findUnique({
            where: { id_pengguna: parseInt(id) }
        });
        if (!pengguna) {
            req.flash('error', 'Pengguna tidak ditemukan.');
            return res.redirect('/admin/list');
        }
        res.render('admin/detail', { title: 'Detail Pengguna', pengguna });
    } catch (error) {
        console.error("Error fetching pengguna details:", error);
        req.flash('error', 'Gagal memuat detail pengguna.');
        res.redirect('/admin/list');
    }
};

// Halaman absensi
exports.getAbsensiPage = async (req, res, next) => {
    const { id } = req.params;
    try {
        const pengguna = await prisma.pengguna.findMany({
            where: { role: 'user' },
            orderBy: { nama: 'asc' }
        });

        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) }
        });

        if (!rapat) {
            req.flash('error', 'Rapat tidak ditemukan.');
            return res.redirect('/admin/list');
        }

        res.render('admin/absensi', { title: 'Absensi Rapat', pengguna, rapat });
    } catch (error) {
        console.error('Error fetching absensi data:', error);
        req.flash('error', 'Gagal memuat halaman absensi.');
        next(error);
    }
};

// Simpan data absensi
exports.saveAbsensi = async (req, res, next) => {
    const { id } = req.params;
    const absensiData = req.body;

    try {
        // Ambil data rapat berdasarkan ID
        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) }
        });

        if (!rapat) {
            req.flash('error', 'Rapat tidak ditemukan.');
            return res.redirect('/admin/list');
        }

        // Proses data absensi dari request
        const absensiEntries = Object.keys(absensiData).map(key => {
            const penggunaId = parseInt(key.split('_')[2]);
            return {
                id_rapat: parseInt(id),
                id_pengguna: penggunaId,
                status_kehadiran: absensiData[key],
                waktu_absen: absensiData[key] === 'hadir' ? new Date() : null
            };
        });

        // Simpan atau perbarui data absensi menggunakan upsert
        for (const entry of absensiEntries) {
            await prisma.peserta_Rapat.upsert({
                where: {
                    id_rapat_id_pengguna: {
                        id_rapat: entry.id_rapat,
                        id_pengguna: entry.id_pengguna
                    }
                },
                update: {
                    status_kehadiran: entry.status_kehadiran,
                    waktu_absen: entry.waktu_absen
                },
                create: entry
            });
        }

        // Kirim pesan sukses dan redirect ke halaman absensi
        req.flash('success', 'Absensi berhasil disimpan!');
        res.redirect(`/rapat/absensi/${id}`);
    } catch (error) {
        console.error('Error saving absensi:', error);
        req.flash('error', 'Gagal menyimpan absensi.');
        next(error);
    }
};

// Ekspor data absensi ke PDF
exports.exportAbsensi = async (req, res, next) => {
    const { id } = req.params;
    try {
        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) },
            include: {
                peserta_rapat: {
                    include: {
                        pengguna: true
                    }
                }
            }
        });

        if (!rapat) {
            req.flash('error', 'Rapat tidak ditemukan.');
            return res.redirect('/admin/list');
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Absensi_Rapat_${rapat.judul}.pdf"`);

        doc.pipe(res);

        doc.fontSize(20).text(`Absensi Rapat: ${rapat.judul}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Tanggal: ${rapat.tanggal.toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}`);
        doc.moveDown();

        doc.fontSize(12).text('Daftar Kehadiran:', { underline: true });
        doc.moveDown();

        rapat.peserta_rapat.forEach((peserta, index) => {
            doc.text(`${index + 1}. ${peserta.pengguna.nama} - ${peserta.status_kehadiran}`);
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting absensi:', error);
        req.flash('error', 'Gagal mengekspor absensi.');
        next(error);
    }
};

exports.getStatistikaPage = async (req, res, next) => {
    try {
        const rapatStats = await prisma.rapat.findMany({
            include: {
                peserta_rapat: true
            },
            orderBy: { tanggal: 'asc' }
        });

        const data = rapatStats.map(rapat => ({
            judul: rapat.judul,
            totalHadir: rapat.peserta_rapat.filter(peserta => peserta.status_kehadiran === 'hadir').length
        }));

        console.log('Rapat Stats:', rapatStats);
        console.log('Data sent to view:', data); // Log tambahan untuk memastikan data dikirim ke view

        res.render('admin/stats', { title: 'Statistika Kehadiran Rapat', data });
    } catch (error) {
        console.error("Error fetching statistika data:", error);
        req.flash('error', 'Gagal memuat data statistika.');
        next(error);
    }
};

// Fungsi untuk mendapatkan rapat yang akan datang
exports.getUpcomingRapat = async (req, res) => {
    try {
        // Ambil tanggal sekarang
        const currentDate = new Date();

        // Ambil semua rapat dengan tanggal lebih besar dari tanggal sekarang
        const upcomingRapat = await prisma.rapat.findMany({
            where: {
                tanggal: {
                    gt: currentDate,  // gt = greater than (lebih besar dari)
                }
            },
            orderBy: {
                tanggal: 'asc'  // Urutkan berdasarkan tanggal (ascending)
            }
        });

        // Render ke tampilan jadwal.ejs dengan data rapat yang akan datang
        res.render('pengguna/jadwal', {
            title: 'Jadwal Rapat',
            rapat: upcomingRapat,
        });
    } catch (error) {
        console.error("Terjadi kesalahan saat mengambil jadwal rapat:", error);
        res.status(500).send("Terjadi kesalahan di server.");
    }
};

exports.getRiwayatRapat = async (req, res, next) => {
    try {
        // Ambil semua rapat yang sudah selesai (tanggal lebih kecil dari hari ini)
        const riwayatRapat = await prisma.rapat.findMany({
            where: {
                tanggal: {
                    lt: new Date(),  // Hanya mengambil rapat yang sudah selesai
                }
            },
            orderBy: {
                tanggal: 'desc',  // Urutkan berdasarkan tanggal terbaru
            }
        });

        // Render riwayat rapat untuk pengguna
        res.render('pengguna/riwayat', {
            title: 'Riwayat Rapat',
            rapat: riwayatRapat, // Data rapat yang sudah selesai
        });
    } catch (error) {
        console.error('Error fetching riwayat rapat:', error);
        req.flash('error', 'Gagal memuat riwayat rapat.');
        next(error);
    }
};

exports.getDetailRapat = async (req, res, next) => {
    const { id } = req.params;

    try {
        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) },
            include: {
                peserta_rapat: {
                    include: {
                        pengguna: true
                    }
                }
            }
        });

        if (!rapat) {
            req.flash('error', 'Rapat tidak ditemukan.');
            return res.redirect('/pengguna/riwayat');
        }

        res.render('pengguna/details', { title: 'Detail Rapat', rapat });
    } catch (error) {
        console.error('Error fetching detail rapat:', error);
        req.flash('error', 'Gagal memuat detail rapat.');
        next(error);
    }
};

// Di dalam penggunaController.js

exports.getDetailRiwayat = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Mengambil detail rapat berdasarkan id
        const riwayat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) },
            include: {
                peserta_rapat: {
                    include: {
                        pengguna: true
                    }
                }
            }
        });

        // Jika rapat tidak ditemukan, tampilkan pesan error
        if (!riwayat) {
            req.flash('error', 'Rapat tidak ditemukan.');
            return res.redirect('/pengguna/riwayat'); // Redirect kembali ke halaman riwayat
        }

        // Render halaman detail riwayat
        res.render('riwayat/detail', { title: 'Detail Riwayat Rapat', riwayat });
    } catch (error) {
        console.error('Error fetching detail riwayat rapat:', error);
        req.flash('error', 'Gagal memuat detail riwayat rapat.');
        next(error);
    }
};

// Di dalam penggunaController.js

exports.getDashboard = async (req, res, next) => {
    try {
        // Ambil rapat yang akan datang dengan judul "Pengumuman Rapat DSI"
        const upcomingRapat = await prisma.rapat.findFirst({
            where: {
                tanggal: {
                    gt: new Date(),  // Rapat yang tanggalnya lebih besar dari hari ini
                }
            },
            orderBy: {
                tanggal: 'asc', // Urutkan berdasarkan tanggal rapat yang akan datang
            }
        });

        // Kirim data pengumuman rapat ke tampilan dashboard
        res.render('pengguna/dashboard', {
            title: 'User Dashboard',
            upcomingRapat : upcomingRapat,
        });
    } catch (error) {
        console.error('Error fetching upcoming rapat for announcement:', error);
        req.flash('error', 'Gagal memuat pengumuman rapat.');
        next(error);
    }
};
