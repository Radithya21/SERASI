const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');


exports.getDaftarRapat = async (req, res, next) => {
    try {
        const rapat = await prisma.rapat.findMany({
            orderBy: { tanggal: 'asc' }
        });
        res.render('rapat/list', { title: 'Daftar Rapat', rapat });
    } catch (error) {
        console.error('Error fetching daftar rapat:', error);
        req.flash('error', 'Gagal memuat daftar rapat.');
        next(error);
    }
};

// Di dalam controller rapatController.js
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
            return res.redirect('/rapat');
        }

        res.render('rapat/detail', { title: 'Detail Rapat', rapat });
    } catch (error) {
        console.error('Error fetching detail rapat:', error);
        req.flash('error', 'Gagal memuat detail rapat.');
        next(error);
    }
};

exports.createRapat = async (req, res, next) => {
    const { judul, tanggal, waktu_mulai, waktu_selesai, tempat, deskripsi, status } = req.body;

    try {
        const newRapat = await prisma.rapat.create({
            data: {
                judul: judul,
                tanggal: new Date(`${tanggal}T00:00:00`),  // Pastikan format tanggal benar
                waktu_mulai: waktu_mulai ? new Date(`${tanggal}T${waktu_mulai}`) : null,  // Jika waktu_mulai ada, ubah menjadi Date
                waktu_selesai: waktu_selesai ? new Date(`${tanggal}T${waktu_selesai}`) : null,  // Jika waktu_selesai ada, ubah menjadi Date
                tempat: tempat,
                status: status || "pending",  // Jika tidak ada status, set default "pending"
                deskripsi: deskripsi || null,
                pengguna: {
                    connect: { id_pengguna: req.session.userId } // Menghubungkan dengan pengguna yang sedang login
                }
            }
        });

        req.flash('success', 'Rapat berhasil dibuat!');
        res.redirect('/rapat'); // Kembali ke halaman daftar rapat
    } catch (error) {
        console.error("Error creating rapat:", error);
        req.flash('error', 'Gagal membuat rapat.');
        next(error);
    }
};

exports.showFormCreateRapat = (req, res) => {
    res.render('rapat/new', { title: 'Buat Rapat Baru' });
};

exports.showFormEditRapat = async (req, res, next) => {
    const { id } = req.params;
    try {
        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) }
        });
        if (!rapat) {
            req.flash('error', 'Rapat tidak ditemukan.');
            return res.redirect('/rapat');
        }
        res.render('rapat/edit', { title: 'Edit Rapat', rapat });
    } catch (error) {
        console.error('Error fetching detail rapat for editing:', error);
        req.flash('error', 'Gagal memuat detail rapat.');
        next(error);
    }
};

// Fungsi untuk menampilkan formulir edit
exports.getEditRapat = async (req, res) => {
    try {
        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(req.params.id) },
            include: { peserta_rapat: true }  // Sesuaikan jika ada relasi
        });

        if (!rapat) {
            req.flash('error', 'Rapat tidak ditemukan');
            return res.redirect('/rapat');
        }

        res.render('rapat/edit', { rapat });
    } catch (error) {
        console.error('Error fetching rapat for edit:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteRapat = async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.rapat.delete({
            where: { id_rapat: parseInt(id) },
        });

        req.flash('success', 'Rapat berhasil dihapus!');
        res.redirect('/rapat');
    } catch (error) {
        if (error.code === 'P2003') {
            req.flash('error', 'Rapat tidak dapat dihapus karena sudah memiliki notulensi terkait.');
        } else {
            console.error('Error deleting rapat:', error);
            req.flash('error', 'Gagal menghapus rapat. Silakan coba lagi.');
        }
        res.redirect('back');
    }
};

// rapatController.js
exports.updateRapat = async (req, res, next) => {
    const { id } = req.params;
    const { judul, tanggal, waktu_mulai, waktu_selesai, tempat, deskripsi } = req.body;

    // Validasi tanggal
    const validTanggal = new Date(tanggal);  // Mengonversi tanggal menjadi objek Date
    if (isNaN(validTanggal.getTime())) {  // Memeriksa apakah tanggal valid
        return res.status(400).send('Tanggal tidak valid');
    }

    // Menyiapkan data yang akan diperbarui
    const validData = {
        judul: judul || undefined,
        tanggal: validTanggal,  // Pastikan tanggal valid
        waktu_mulai: waktu_mulai || null,
        waktu_selesai: waktu_selesai || null,
        tempat: tempat || undefined,
        deskripsi: deskripsi || null
    };

    try {
        // Melakukan pembaruan rapat
        const rapatUpdated = await prisma.rapat.update({
            where: { id_rapat: parseInt(id) },
            data: validData
        });

        // Setelah berhasil, alihkan ke detail rapat yang baru diupdate
        res.redirect(`/rapat/detail/ ${rapatUpdated.id_rapat}`);
    } catch (error) {
        console.error("Error updating rapat:", error);
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
        res.render('rapat/jadwal', {
            title: 'Jadwal Rapat',
            rapat: upcomingRapat,
        });
    } catch (error) {
        console.error("Terjadi kesalahan saat mengambil jadwal rapat:", error);
        res.status(500).send("Terjadi kesalahan di server.");
    }
};

// Menampilkan riwayat rapat (rapat yang sudah selesai)
exports.getRiwayatRapat = async (req, res, next) => {
    try {
        // Ambil semua rapat yang sudah selesai
        const riwayatRapat = await prisma.rapat.findMany({
            where: {
                tanggal: {
                    lt: new Date(), // Hanya mengambil rapat yang sudah selesai (tanggal lebih kecil dari hari ini)
                },
            },
            orderBy: {
                tanggal: 'desc', // Urutkan berdasarkan tanggal terbaru
            },
        });

        // Hitung statistik jumlah rapat per bulan
        const statistik = {};
        riwayatRapat.forEach(item => {
            const date = new Date(item.tanggal);
            const bulan = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            statistik[bulan] = (statistik[bulan] || 0) + 1;
        });

        // Hitung statistik jumlah rapat per minggu
        const statistikMingguan = { labels: [], data: [] };
        if (riwayatRapat.length > 0) {
            // Buat map: key = 'YYYY-WW', value = jumlah rapat
            const weekMap = {};
            riwayatRapat.forEach(item => {
                const date = new Date(item.tanggal);
                // Mendapatkan tahun dan minggu ke berapa
                const year = date.getFullYear();
                // ISO week number
                const firstJan = new Date(date.getFullYear(), 0, 1);
                const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
                const week = Math.ceil((date.getDay() + 1 + days) / 7);
                const key = `${year}-Minggu ${week}`;
                weekMap[key] = (weekMap[key] || 0) + 1;
            });
            // Urutkan key secara kronologis
            const sortedKeys = Object.keys(weekMap).sort((a, b) => {
                const [yA, wA] = a.split('-Minggu ').map(Number);
                const [yB, wB] = b.split('-Minggu ').map(Number);
                return yA !== yB ? yA - yB : wA - wB;
            });
            statistikMingguan.labels = sortedKeys;
            statistikMingguan.data = sortedKeys.map(k => weekMap[k]);
        }

        // Kirim data riwayat rapat dan statistik ke tampilan
        res.render('rapat/riwayat', {
            title: 'Riwayat Rapat',
            rapat: riwayatRapat, // Data rapat yang sudah selesai
            statistik, // Data statistik rapat per bulan
            statistikMingguan // Data statistik rapat per minggu untuk Chart.js
        });
    } catch (err) {
        next(err);
    }
};

// Fungsi untuk ekspor riwayat rapat ke PDF menggunakan PDFKit
exports.exportRiwayatToPDF = async (req, res, next) => {
    try {
        const riwayatRapat = await prisma.rapat.findMany({
            where: {
                tanggal: {
                    lt: new Date(), // Hanya mengambil rapat yang sudah selesai
                },
            },
            orderBy: {
                tanggal: 'desc',
            },
        });

        // Membuat dokumen PDF
        const doc = new PDFDocument();

        // Mengatur ukuran kertas dan margin
        doc.page.margins = { top: 50, left: 50, bottom: 50, right: 50 };

        // Menyediakan header
        doc.fontSize(18).text('Riwayat Rapat', { align: 'center' }).moveDown(2);

        // Menambahkan tabel header
        const tableTop = 150;
        const rowHeight = 20;
        const columnWidths = [150, 100, 100]; // Menentukan lebar kolom
        doc.fontSize(12);
        
        // Header Tabel
        doc.text('Judul', columnWidths[0], tableTop);
        doc.text('Tanggal', columnWidths[0] + columnWidths[0], tableTop);
        doc.text('Tempat', columnWidths[0] + columnWidths[0] + columnWidths[1], tableTop);
        
        // Garis Bawah Header
        doc.moveTo(columnWidths[0], tableTop + rowHeight)
        .lineTo(columnWidths[0] + columnWidths[0] + columnWidths[1] + columnWidths[2], tableTop + rowHeight)
        .stroke();

        let currentRow = tableTop + rowHeight + 10;
        
        // Menambahkan data rapat ke dalam tabel
        riwayatRapat.forEach((rapat) => {
            const formattedDate = new Date(rapat.tanggal).toLocaleDateString('id-ID'); // Format tanggal

            // Menambahkan baris data ke tabel
            doc.text(rapat.judul, columnWidths[0], currentRow);
            doc.text(formattedDate, columnWidths[0] + columnWidths[0], currentRow);
            doc.text(rapat.tempat, columnWidths[0] + columnWidths[0] + columnWidths[1], currentRow);

            // Garis Bawah Baris Data
            doc.moveTo(columnWidths[0], currentRow + rowHeight)
            .lineTo(columnWidths[0] + columnWidths[0] + columnWidths[1] + columnWidths[2], currentRow + rowHeight)
            .stroke();

            currentRow += rowHeight + 10;
        });

        // Mengirim PDF ke client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=riwayat_rapat.pdf');
        doc.pipe(res);
        doc.end();

    } catch (err) {
        next(err);
    }
};


exports.inputKehadiran = async (req, res, next) => {
    const { rapatId, penggunaId, statusKehadiran, keterangan } = req.body;
    try {
        const existingAttendance = await prisma.peserta_Rapat.findUnique({
            where: {
                unique_participant: { // Ini adalah @@unique([rapat_id, pengguna_id])
                    rapat_id: parseInt(rapatId),
                    pengguna_id: parseInt(penggunaId)
                }
            }
        });

        if (existingAttendance) {
            await prisma.peserta_Rapat.update({
                where: { id: existingAttendance.id },
                data: {
                    status_kehadiran: statusKehadiran,
                    keterangan: keterangan || null,
                    waktu_absen: statusKehadiran === 'hadir' ? new Date() : null
                }
            });
            req.flash('success', 'Kehadiran berhasil diperbarui!');
        } else {
            await prisma.peserta_Rapat.create({
                data: {
                    rapat_id: parseInt(rapatId),
                    pengguna_id: parseInt(penggunaId),
                    status_kehadiran: statusKehadiran,
                    keterangan: keterangan || null,
                    waktu_absen: statusKehadiran === 'hadir' ? new Date() : null
                }
            });
            req.flash('success', 'Kehadiran berhasil dicatat!');
        }
        res.redirect(`/rapat/${rapatId}`); // Kembali ke detail rapat
    } catch (error) {
        console.error("Error recording attendance:", error);
        req.flash('error', 'Gagal mencatat kehadiran.');
        next(error);
    }
};

exports.getAbsensiPage = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Ambil data rapat dan absensi yang sudah ada
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

        const pengguna = await prisma.pengguna.findMany({
            where: {
                role: 'user'
            }
        });

        if (!rapat || pengguna.length === 0) {
            req.flash('error', 'Data rapat atau pengguna tidak ditemukan.');
            return res.redirect('/rapat');
        }

        // Gabungkan data pengguna dengan data absensi
        const absensiData = pengguna.map(user => {
            const absensi = rapat.peserta_rapat.find(p => p.id_pengguna === user.id_pengguna);
            return {
                id_pengguna: user.id_pengguna,
                nama: user.nama,
                email: user.email,
                status_kehadiran: absensi ? absensi.status_kehadiran : 'tidak hadir', // Default 'tidak hadir'
                waktu_absen: absensi ? absensi.waktu_absen : null
            };
        });

        res.render('admin/absensi', { title: 'Absensi Rapat', pengguna: absensiData, rapat });
        console.log('Data absensi:', rapat.peserta_rapat);
        console.log('Data pengguna:', pengguna);
    } catch (error) {
        console.error('Error fetching absensi page:', error);
        req.flash('error', 'Gagal memuat halaman absensi.');
        next(error);
    }
};

// Fungsi untuk ekspor daftar rapat yang akan datang ke PDF menggunakan PDFKit
exports.exportUpcomingRapatToPDF = async (req, res, next) => {
    try {
        const upcomingRapat = await prisma.rapat.findMany({
            where: {
                tanggal: {
                    gt: new Date(), // Mengambil rapat yang tanggalnya lebih besar dari tanggal sekarang
                },
            },
            orderBy: {
                tanggal: 'asc', // Urutkan berdasarkan tanggal yang akan datang
            },
        });

        // Membuat dokumen PDF
        const doc = new PDFDocument();

        // Mengatur ukuran kertas dan margin
        doc.page.margins = { top: 50, left: 50, bottom: 50, right: 50 };

        // Menyediakan header
        doc.fontSize(18).text('Daftar Rapat yang Akan Datang', { align: 'center' }).moveDown(2);

        // Menambahkan tabel header
        const tableTop = 150;
        const rowHeight = 20;
        const columnWidths = [150, 100, 100]; // Menentukan lebar kolom
        doc.fontSize(12);

        // Header Tabel
        doc.text('Judul', columnWidths[0], tableTop);
        doc.text('Tanggal', columnWidths[0] + columnWidths[0], tableTop);
        doc.text('Tempat', columnWidths[0] + columnWidths[0] + columnWidths[1], tableTop);

        // Garis Bawah Header
        doc.moveTo(columnWidths[0], tableTop + rowHeight)
        .lineTo(columnWidths[0] + columnWidths[0] + columnWidths[1] + columnWidths[2], tableTop + rowHeight)
        .stroke();

        let currentRow = tableTop + rowHeight + 10;

        // Menambahkan data rapat ke dalam tabel
        upcomingRapat.forEach((rapat) => {
            const formattedDate = new Date(rapat.tanggal).toLocaleDateString('id-ID'); // Format tanggal

            // Menambahkan baris data ke tabel
            doc.text(rapat.judul, columnWidths[0], currentRow);
            doc.text(formattedDate, columnWidths[0] + columnWidths[0], currentRow);
            doc.text(rapat.tempat, columnWidths[0] + columnWidths[0] + columnWidths[1], currentRow);

            // Garis Bawah Baris Data
            doc.moveTo(columnWidths[0], currentRow + rowHeight)
            .lineTo(columnWidths[0] + columnWidths[0] + columnWidths[1] + columnWidths[2], currentRow + rowHeight)
            .stroke();

            currentRow += rowHeight + 10;
        });

        // Mengirim PDF ke client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=daftar_rapat_akan_datang.pdf');
        doc.pipe(res);
        doc.end();

    } catch (err) {
        next(err);
    }
};

// Statistik mingguan rapat (untuk halaman /riwayat/statistik)
exports.getStatistikMingguan = async (req, res, next) => {
    try {
        const riwayatRapat = await prisma.rapat.findMany({
            where: {
                tanggal: {
                    lt: new Date(),
                },
            },
            orderBy: {
                tanggal: 'desc',
            },
        });
        // Hitung statistik jumlah rapat per minggu
        const statistikMingguan = { labels: [], data: [] };
        if (riwayatRapat.length > 0) {
            const weekMap = {};
            riwayatRapat.forEach(item => {
                const date = new Date(item.tanggal);
                const year = date.getFullYear();
                const firstJan = new Date(date.getFullYear(), 0, 1);
                const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
                const week = Math.ceil((date.getDay() + 1 + days) / 7);
                const key = `${year}-Minggu ${week}`;
                weekMap[key] = (weekMap[key] || 0) + 1;
            });
            const sortedKeys = Object.keys(weekMap).sort((a, b) => {
                const [yA, wA] = a.split('-Minggu ').map(Number);
                const [yB, wB] = b.split('-Minggu ').map(Number);
                return yA !== yB ? yA - yB : wA - wB;
            });
            statistikMingguan.labels = sortedKeys;
            statistikMingguan.data = sortedKeys.map(k => weekMap[k]);
        }
        res.render('rapat/statistik', {
            title: 'Statistik Rapat per Minggu',
            statistikMingguan
        });
    } catch (err) {
        next(err);
    }
};
