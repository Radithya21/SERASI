const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

exports.getDetailRapat = async (req, res, next) => {
    const { id } = req.params;
    try {
        const rapat = await prisma.rapat.findUnique({
            where: { id_rapat: parseInt(id) }
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
    const { judul, tanggal, waktu_mulai, waktu_selesai, tempat, status, deskripsi } = req.body;

    try {
        await prisma.rapat.create({
            data: {
                judul,
                tanggal: new Date(`${tanggal}T00:00:00`),
                waktu_mulai: new Date(`${tanggal}T${waktu_mulai}`),
                waktu_selesai: new Date(`${tanggal}T${waktu_selesai}`),
                tempat,
                status,
                deskripsi: deskripsi || null,
                created_by: req.session.user.id_pengguna // pastikan ada session login
            }
        });

        req.flash('success', 'Rapat berhasil dibuat!');
        res.redirect('/rapat');
    } catch (error) {
        console.error('Error creating rapat:', error);
        req.flash('error', 'Gagal membuat rapat.');
        next(error);
    }
};


exports.showFormCreateRapat = (req, res) => {
    res.render('rapat/new', { title: 'Buat Rapat Baru' });
};



