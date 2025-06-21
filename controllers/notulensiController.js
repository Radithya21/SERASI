const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

exports.getDaftarNotulensi = async (req, res, next) => {
    try {
        console.log('Memulai getDaftarNotulensi...');
        // Mengambil semua notulensi rapat, diurutkan berdasarkan waktu pembaruan terbaru.
        const notulensiList = await prisma.notulen_Rapat.findMany({
            orderBy: { updated_at: 'desc' }, // Menggunakan updated_at untuk pengurutan
            include: { // Mengambil data rapat terkait jika diperlukan
                rapat: true
            }
        });
        console.log(`Berhasil mengambil ${notulensiList.length} notulensi.`);

        res.render('notulensi/list', {
            title: 'Daftar Notulensi',
            notulensiList: notulensiList,
            success_msg: req.flash('success'), // Meneruskan pesan flash
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/list.ejs.');

    } catch (error) {
        console.error('ERROR di getDaftarNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memuat daftar notulensi. Silakan coba lagi nanti.');
        res.redirect('/');
    }
};

exports.showFormCreateNotulensi = async (req, res) => {
    try {
        console.log('Memulai showFormCreateNotulensi...');
        const rapatList = await prisma.rapat.findMany({
            orderBy: { tanggal: 'desc' }
        });
        console.log(`Berhasil mengambil ${rapatList.length} rapat untuk form.`);
        res.render('notulensi/form', {
            title: 'Buat Notulensi Baru',
            notulensi: null,
            rapatList: rapatList,
            isEdit: false,
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/form.ejs (create).');
    } catch (error) {
        console.error('ERROR di showFormCreateNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memuat form notulensi baru. Pastikan database dan model Rapat sudah benar.');
        res.redirect('/notulensi');
    }
};

exports.createNotulensi = async (req, res, next) => {
    const { judul, isi_notulen, status, rapatId } = req.body;
    const userId = req.session.user ? req.session.user.id_pengguna : 1;

    try {
        console.log('Memulai createNotulensi dengan data:', { judul, isi_notulen, status, rapatId, userId });
        const existingNotulen = await prisma.notulen_Rapat.findUnique({
            where: { id_rapat: parseInt(rapatId) }
        });

        if (existingNotulen) {
            console.warn(`Rapat ID ${rapatId} sudah memiliki notulensi.`);
            req.flash('error', 'Rapat ini sudah memiliki notulensi.');
            return res.redirect(`/notulensi/detail/${existingNotulen.id_notulen}`);
        }

        const newNotulen = await prisma.notulen_Rapat.create({
            data: {
                id_rapat: parseInt(rapatId),
                isi_notulen: isi_notulen,
                status: status || 'draft',
                created_by: userId,
                published_at: (status === 'uploaded') ? new Date() : null,
            }
        });
        console.log('Notulensi berhasil dibuat:', newNotulen.id_notulen);
        req.flash('success', 'Notulensi berhasil dibuat!');
        res.redirect(`/notulensi/detail/${newNotulen.id_notulen}`);
    } catch (error) {
        console.error('ERROR di createNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal membuat notulensi. Pastikan semua bidang terisi dan rapat belum memiliki notulensi.');
        next(error);
    }
};

exports.getDetailNotulensi = async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Memulai getDetailNotulensi untuk ID: ${id}`);
        const notulensi = await prisma.notulen_Rapat.findUnique({
            where: { id_notulen: parseInt(id) },
            include: {
                rapat: {
                    include: {
                        dokumen: true
                    }
                }
            }
        });

        if (!notulensi) {
            console.warn(`Notulensi dengan ID ${id} tidak ditemukan.`);
            req.flash('error', 'Notulensi tidak ditemukan.');
            return res.redirect('/notulensi');
        }
        console.log('Notulensi ditemukan:', notulensi.id_notulen);
        res.render('notulensi/detail', {
            title: notulensi.rapat ? notulensi.rapat.judul : 'Detail Notulensi',
            notulensi: notulensi,
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/detail.ejs.');
    } catch (error) {
        console.error('ERROR di getDetailNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memuat detail notulensi.');
        next(error);
    }
};

exports.showFormEditNotulensi = async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Memulai showFormEditNotulensi untuk ID: ${id}`);
        const notulensi = await prisma.notulen_Rapat.findUnique({
            where: { id_notulen: parseInt(id) },
            include: { rapat: true }
        });

        if (!notulensi) {
            console.warn(`Notulensi dengan ID ${id} tidak ditemukan untuk diedit.`);
            req.flash('error', 'Notulensi tidak ditemukan.');
            return res.redirect('/notulensi');
        }

        const rapatList = await prisma.rapat.findMany({
            orderBy: { tanggal: 'desc' }
        });
        console.log('Notulensi ditemukan dan rapatList diambil.');
        res.render('notulensi/form', {
            title: `Edit Notulensi: ${notulensi.rapat ? notulensi.rapat.judul : 'Tanpa Judul Rapat'}`,
            notulensi: notulensi,
            rapatList: rapatList,
            isEdit: true,
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/form.ejs (edit).');
    } catch (error) {
        console.error('ERROR di showFormEditNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memuat notulensi untuk diedit.');
        next(error);
    }
};

exports.updateNotulensi = async (req, res, next) => {
    const { id } = req.params;
    const { isi_notulen, status, rapatId } = req.body; // rapatId tetap ada, walaupun tidak digunakan langsung di update data notulen

    try {
        console.log(`Memulai updateNotulensi untuk ID: ${id} dengan status: ${status}`);
        const updatedData = {
            isi_notulen: isi_notulen,
            status: status || 'draft',
        };

        if (status === 'uploaded') {
            const currentNotulen = await prisma.notulen_Rapat.findUnique({
                where: { id_notulen: parseInt(id) },
                select: { published_at: true }
            });
            // Atur published_at hanya jika sebelumnya belum ada
            if (!currentNotulen.published_at) {
                updatedData.published_at = new Date();
                console.log('published_at diatur karena status uploaded.');
            }
        } else {
            // Jika status bukan 'uploaded', pastikan published_at di-null-kan jika sebelumnya ada
            updatedData.published_at = null;
        }

        const updatedNotulen = await prisma.notulen_Rapat.update({
            where: { id_notulen: parseInt(id) },
            data: updatedData
        });
        console.log('Notulensi berhasil diperbarui:', updatedNotulen.id_notulen);
        req.flash('success', 'Notulensi berhasil diperbarui!');
        res.redirect(`/notulensi/detail/${updatedNotulen.id_notulen}`);
    } catch (error) {
        console.error('ERROR di updateNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memperbarui notulensi. Pastikan tidak ada duplikasi rapat.');
        next(error);
    }
};

exports.deleteNotulensi = async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Memulai deleteNotulensi untuk ID: ${id}`);
        await prisma.notulen_Rapat.delete({
            where: { id_notulen: parseInt(id) },
        });
        console.log('Notulensi berhasil dihapus:', id);
        req.flash('success', 'Notulensi berhasil dihapus!');
        res.redirect('/notulensi');
    } catch (error) {
        console.error('ERROR di deleteNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal menghapus notulensi.');
        next(error);
    }
};

exports.getDraftNotulensi = async (req, res, next) => {
    try {
        console.log('Memulai getDraftNotulensi...');
        const draftNotulensiList = await prisma.notulen_Rapat.findMany({
            where: { status: 'draft' },
            orderBy: { updated_at: 'desc' },
            include: { rapat: true }
        });
        console.log(`Berhasil mengambil ${draftNotulensiList.length} draft notulensi.`);
        res.render('notulensi/drafts', {
            title: 'Draft Notulensi',
            draftNotulensiList: draftNotulensiList,
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/drafts.ejs.');
    } catch (error) {
        console.error('ERROR di getDraftNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memuat draft notulensi.');
        next(error);
    }
};

exports.exportNotulensi = async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Memulai exportNotulensi untuk ID: ${id}`);
        const notulensi = await prisma.notulen_Rapat.findUnique({
            where: { id_notulen: parseInt(id) },
            include: {
                rapat: {
                    include: {
                        dokumen: true
                    }
                }
            }
        });

        if (!notulensi) {
            console.warn(`Notulensi dengan ID ${id} tidak ditemukan untuk diekspor.`);
            req.flash('error', 'Notulensi tidak ditemukan.');
            return res.redirect('/notulensi');
        }
        console.log('Notulensi ditemukan untuk ekspor.');
        // Bangun konten yang akan diekspor
        const rapatJudul = notulensi.rapat ? notulensi.rapat.judul : 'Rapat Tidak Diketahui';
        const dokumentasiFiles = notulensi.rapat && notulensi.rapat.dokumen.length > 0
            ? notulensi.rapat.dokumen.map(doc => `- ${doc.nama_file}`).join('\n')
            : 'Tidak ada dokumen terkait.';

        const exportContent = `
Notulensi Rapat
========================

Judul Rapat: ${rapatJudul}
Tanggal Rapat: ${notulensi.rapat ? new Date(notulensi.rapat.tanggal).toLocaleDateString('id-ID') : 'Tidak Diketahui'}
Waktu: ${notulensi.rapat ? `${new Date(notulensi.rapat.waktu_mulai).toLocaleTimeString('id-ID')} - ${new Date(notulensi.rapat.waktu_selesai).toLocaleTimeString('id-ID')}` : 'Tidak Diketahui'}
Tempat: ${notulensi.rapat ? notulensi.rapat.tempat : 'Tidak Diketahui'}

Isi Notulensi:
------------------------
${notulensi.isi_notulen}

Status: ${notulensi.status === 'draft' ? 'Draft' : 'Diunggah'}
Dibuat Oleh: ${notulensi.created_by} (ID Pengguna)
Tanggal Dibuat: ${new Date(notulensi.updated_at).toLocaleDateString('id-ID')}
Tanggal Diterbitkan: ${notulensi.published_at ? new Date(notulensi.published_at).toLocaleDateString('id-ID') : 'Belum Diterbitkan'}

Dokumentasi Terkait Rapat:
------------------------
${dokumentasiFiles}
`;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="notulensi_rapat_${rapatJudul.replace(/\s/g, '_')}.txt"`); // Menambahkan ekstensi .txt
        res.send(exportContent);
        console.log('Notulensi berhasil diekspor.');

    } catch (error) {
        console.error('ERROR di exportNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal mengekspor notulensi.');
        next(error);
    }
};

// --- Fungsi Baru untuk Arsip Notulensi ---
exports.getArsipNotulensi = async (req, res, next) => {
    try {
        console.log('Memulai getArsipNotulensi...');
        // Mengambil notulensi yang dianggap "diarsipkan" (misal: status 'uploaded')
        const arsipList = await prisma.notulen_Rapat.findMany({
            where: { status: 'uploaded' }, // Filter berdasarkan status 'uploaded'
            orderBy: { published_at: 'desc' }, // Urutkan berdasarkan tanggal publikasi terbaru
            include: { // Sertakan data rapat terkait jika diperlukan
                rapat: {
                    include: {
                        dokumen: true // Sertakan dokumen terkait rapat jika ada
                    }
                }
            }
        });
        console.log(`Berhasil mengambil ${arsipList.length} notulensi arsip.`);

        res.render('notulensi/arsip', { // Render view 'notulensi/arsip.ejs'
            title: 'Arsip Notulensi',
            arsip: arsipList, // Kirim data notulensi arsip ke view dengan nama 'arsip'
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/arsip.ejs.');

    } catch (error) {
        console.error('ERROR di getArsipNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal memuat arsip notulensi. Silakan coba lagi nanti.');
        res.redirect('/');
    }
}; 