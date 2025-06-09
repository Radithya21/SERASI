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
