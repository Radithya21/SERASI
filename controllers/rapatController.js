const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

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