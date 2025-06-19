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

// Ekspor daftar pengguna ke PDF
exports.exportPenggunaPDF = async (req, res, next) => {
    try {
        const pengguna = await prisma.pengguna.findMany();

        const doc = new PDFDocument({
            margin: 40,
            size: 'A4'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="daftar_pengguna.pdf"');

        doc.pipe(res);

        // Header dengan styling yang lebih baik
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('Daftar Pengguna', { align: 'center' });

        // Garis pembatas di bawah judul
        doc.moveTo(40, 80)
            .lineTo(555, 80)
            .strokeColor('#cccccc')
            .lineWidth(1)
            .stroke();

        doc.moveDown(1.5);

        // Konfigurasi tabel yang lebih baik
        const tableTop = 110;
        const rowHeight = 25;
        const columnWidths = [40, 120, 180, 80, 95];
        const columnPositions = [40, 80, 200, 380, 460];
        const tableWidth = 515; // Total width dari margin kiri ke kanan

        // Fungsi untuk menggambar garis horizontal
        const drawHorizontalLine = (y, strokeColor = '#000000', lineWidth = 0.5) => {
            doc.moveTo(40, y)
                .lineTo(555, y)
                .strokeColor(strokeColor)
                .lineWidth(lineWidth)
                .stroke();
        };

        // Fungsi untuk menggambar garis vertikal
        const drawVerticalLines = (top, bottom) => {
            doc.strokeColor('#cccccc').lineWidth(0.5);
            // Garis vertikal untuk setiap kolom
            columnPositions.forEach((pos, index) => {
                if (index === 0) {
                    // Garis paling kiri
                    doc.moveTo(40, top).lineTo(40, bottom).stroke();
                }
                // Garis pemisah kolom
                doc.moveTo(pos + columnWidths[index], top)
                    .lineTo(pos + columnWidths[index], bottom)
                    .stroke();
            });
        };

        // Header tabel dengan background
        doc.rect(40, tableTop - 5, tableWidth, rowHeight)
            .fillColor('#f8f9fa')
            .fill();

        // Teks header tabel
        doc.fillColor('#000000')
            .fontSize(12)
            .font('Helvetica-Bold');

        doc.text('No', columnPositions[0] + 5, tableTop + 5, {
            width: columnWidths[0] - 10,
            align: 'center'
        });
        doc.text('Nama', columnPositions[1] + 5, tableTop + 5, {
            width: columnWidths[1] - 10,
            align: 'left'
        });
        doc.text('Email', columnPositions[2] + 5, tableTop + 5, {
            width: columnWidths[2] - 10,
            align: 'left'
        });
        doc.text('Role', columnPositions[3] + 5, tableTop + 5, {
            width: columnWidths[3] - 10,
            align: 'center'
        });
        doc.text('NIP', columnPositions[4] + 5, tableTop + 5, {
            width: columnWidths[4] - 10,
            align: 'center'
        });

        // Garis bawah header
        drawHorizontalLine(tableTop + rowHeight, '#000000', 1);

        // Data rows
        let currentY = tableTop + rowHeight;
        doc.fontSize(10).font('Helvetica');

        pengguna.forEach((user, index) => {
            const rowY = currentY;

            // Alternating row colors untuk kemudahan membaca
            if (index % 2 === 0) {
                doc.rect(40, rowY, tableWidth, rowHeight)
                    .fillColor('#f8f9fa')
                    .fill();
            }

            // Reset text color
            doc.fillColor('#000000');

            // Data dalam setiap kolom
            doc.text(String(index + 1), columnPositions[0] + 5, rowY + 8, {
                width: columnWidths[0] - 10,
                align: 'center'
            });

            doc.text(user.nama || '-', columnPositions[1] + 5, rowY + 8, {
                width: columnWidths[1] - 10,
                align: 'left',
                ellipsis: true
            });

            doc.text(user.email || '-', columnPositions[2] + 5, rowY + 8, {
                width: columnWidths[2] - 10,
                align: 'left',
                ellipsis: true
            });

            doc.text(user.role || '-', columnPositions[3] + 5, rowY + 8, {
                width: columnWidths[3] - 10,
                align: 'center'
            });

            doc.text(user.nip || '-', columnPositions[4] + 5, rowY + 8, {
                width: columnWidths[4] - 10,
                align: 'center',
                ellipsis: true
            });

            currentY += rowHeight;

            // Cek apakah perlu pindah halaman
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;

                // Ulangi header di halaman baru
                doc.rect(40, currentY - 5, tableWidth, rowHeight)
                    .fillColor('#f8f9fa')
                    .fill();

                doc.fillColor('#000000')
                    .fontSize(12)
                    .font('Helvetica-Bold');

                doc.text('No', columnPositions[0] + 5, currentY + 5, {
                    width: columnWidths[0] - 10,
                    align: 'center'
                });
                doc.text('Nama', columnPositions[1] + 5, currentY + 5, {
                    width: columnWidths[1] - 10,
                    align: 'left'
                });
                doc.text('Email', columnPositions[2] + 5, currentY + 5, {
                    width: columnWidths[2] - 10,
                    align: 'left'
                });
                doc.text('Role', columnPositions[3] + 5, currentY + 5, {
                    width: columnWidths[3] - 10,
                    align: 'center'
                });
                doc.text('NIP', columnPositions[4] + 5, currentY + 5, {
                    width: columnWidths[4] - 10,
                    align: 'center'
                });

                drawHorizontalLine(currentY + rowHeight, '#000000', 1);
                currentY += rowHeight;
                doc.fontSize(10).font('Helvetica');
            }
        });

        // Gambar border tabel
        drawVerticalLines(tableTop - 5, currentY);
        drawHorizontalLine(currentY, '#000000', 1);

        // Footer dengan informasi tambahan
        const footerY = currentY + 30;
        doc.fontSize(8)
            .fillColor('#666666')
            .text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`, 40, footerY);

        doc.text(`Total Pengguna: ${pengguna.length}`, 40, footerY + 12);

        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        req.flash('error', 'Gagal mengekspor daftar pengguna.');
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

