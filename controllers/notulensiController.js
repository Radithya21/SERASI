// controllers/notulensiController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const multer = require('multer');
const path = require('path');

// Konfigurasi Multer untuk upload dokumentasi dengan validasi file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/dokumentasi'), // Ubah ke uploads/dokumentasi (bukan public/uploads/dokumentasi)
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
function fileFilter (req, file, cb) {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) dan PDF yang diperbolehkan!'), false);
  }
  cb(null, true);
}
exports.uploadDokumentasi = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});


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

        // Log untuk melihat data yang akan dilewatkan ke view
        // console.log('Data yang akan dirender di list.ejs:', notulensiList);

        res.render('notulensi/list', { 
            title: 'Daftar Notulensi', 
            notulensiList: notulensiList,
            success_msg: req.flash('success'), // Meneruskan pesan flash
            error_msg: req.flash('error')
        });
        console.log('Berhasil merender notulensi/list.ejs.');

    } catch (error) {
        console.error('ERROR di getDaftarNotulensi:', error);
        // Log stack trace lengkap untuk membantu debugging
        console.error(error.stack); 
        req.flash('error', 'Gagal memuat daftar notulensi. Silakan coba lagi nanti.');
        // next(error); // Biarkan error handler global menanganinya
        res.redirect('/'); // Atau redirect ke halaman utama atau halaman error khusus jika Anda mau
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

exports.createNotulensi = async (req, res) => {
  try {
    // 1. Simpan notulensi dulu
    const notulensi = await prisma.notulen_Rapat.create({
      data: {
        id_rapat: parseInt(req.body.rapatId),
        isi_notulen: req.body.isi_notulen,
        status: req.body.status || 'draft',
        created_by: req.user ? req.user.id_pengguna : 1 // fallback jika tidak ada auth
      }
    });

    // 2. Simpan dokumentasi (jika ada file)
    if (req.files && req.files.length > 0) {
      const doks = req.files.map(file => ({
        id_notulen: notulensi.id_notulen,
        nama_file: file.originalname,
        path_file: path.posix.join('/uploads/dokumentasi', file.filename) // pastikan path selalu benar
      }));
      await prisma.dokumentasi.createMany({ data: doks });
    }

    req.flash('success', 'Notulensi dan dokumentasi berhasil disimpan!');
    res.redirect('/notulensi');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menyimpan notulensi');
    res.redirect('back');
  }
};

exports.getDetailNotulensi = async (req, res, next) => {
    // ... (kode yang sama seperti sebelumnya, tambahkan console.log jika diperlukan)
    const { id } = req.params;
    try {
        console.log(`Memulai getDetailNotulensi untuk ID: ${id}`);
        const notulensi = await prisma.notulen_Rapat.findUnique({
            where: { id_notulen: parseInt(id) },
            include: {
                rapat: true,
                dokumentasi: true
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
    // ... (kode yang sama seperti sebelumnya, tambahkan console.log jika diperlukan)
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
    const { isi_notulen, status } = req.body;
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
            if (!currentNotulen.published_at) {
                updatedData.published_at = new Date();
                console.log('published_at diatur karena status uploaded.');
            }
        } else {
            updatedData.published_at = null;
        }
        const updatedNotulen = await prisma.notulen_Rapat.update({
            where: { id_notulen: parseInt(id) },
            data: updatedData
        });
        // Proses upload dokumentasi tambahan (jika ada file)
        if (req.files && req.files.length > 0) {
            const doks = req.files.map(file => ({
                id_notulen: updatedNotulen.id_notulen,
                nama_file: file.originalname,
                path_file: path.posix.join('/uploads/dokumentasi', file.filename) // pastikan path selalu benar
            }));
            await prisma.dokumentasi.createMany({ data: doks });
        }
        req.flash('success', 'Notulensi berhasil diperbarui!');
        res.redirect(`/notulensi/detail/${updatedNotulen.id_notulen}`);
    } catch (error) {
        let msg = error.message || 'Gagal memperbarui notulensi.';
        if (error.code === 'LIMIT_FILE_SIZE') {
            msg = 'Ukuran file terlalu besar (maksimal 2MB per file).';
        }
        req.flash('error', msg);
        next(error);
    }
};

exports.deleteNotulensi = async (req, res, next) => {
    // ... (kode yang sama seperti sebelumnya, tambahkan console.log jika diperlukan)
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
    // ... (kode yang sama seperti sebelumnya, tambahkan console.log jika diperlukan)
    try {
        console.log('Memulai getDraftNotulensi...');
        const draftNotulensiList = await prisma.notulen_Rapat.findMany({
            where: { status: 'draft' },
            orderBy: { updated_at: 'desc' },
            include: { rapat: true, dokumentasi: true }
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
                },
                dokumentasi: true
            }
        });

        if (!notulensi) {
            console.warn(`Notulensi dengan ID ${id} tidak ditemukan untuk diekspor.`);
            req.flash('error', 'Notulensi tidak ditemukan.');
            return res.redirect('/notulensi');
        }

        const doc = new PDFDocument({ margin: 50 });
        const filename = `notulensi_rapat_${notulensi.id_notulen}.pdf`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        const rapat = notulensi.rapat;

// Header dengan garis bawah
        doc
            .fontSize(26)
            .font('Helvetica-Bold')
            .fillColor('#2E4053')
            .text('NOTULENSI RAPAT', { align: 'center' })
            .moveDown(0.5);
        doc
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor('#2E4053')
            .lineWidth(2)
            .stroke()
            .moveDown(1.5);

        // Info rapat
        doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .fillColor('black')
            .text(`Judul Rapat: `, { continued: true })
            .font('Helvetica')
            .text(`${rapat?.judul || '-'}`)
            .font('Helvetica-Bold')
            .text(`Tanggal Rapat: `, { continued: true })
            .font('Helvetica')
            .text(`${rapat?.tanggal ? new Date(rapat.tanggal).toLocaleDateString('id-ID') : '-'}`)
            .font('Helvetica-Bold')
            .text(`Tempat: `, { continued: true })
            .font('Helvetica')
            .text(`${rapat?.tempat || '-'}`)
            .moveDown();

        // Garis pemisah
        doc
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor('#ABB2B9')
            .lineWidth(1)
            .stroke()
            .moveDown();

        // Isi Notulensi
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#154360')
            .text('Isi Notulensi', { underline: true })
            .moveDown(0.5);
        doc
            .font('Helvetica')
            .fontSize(12)
            .fillColor('black')
            .text(notulensi.isi_notulen || '-', { align: 'justify' })
            .moveDown();

        // Info tambahan
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Status: ', { continued: true })
            .font('Helvetica')
            .text(`${notulensi.status}`)
            .font('Helvetica-Bold')
            .text('Dibuat oleh ID: ', { continued: true })
            .font('Helvetica')
            .text(`${notulensi.created_by}`)
            .font('Helvetica-Bold')
            .text('Tanggal Dibuat: ', { continued: true })
            .font('Helvetica')
            .text(`${new Date(notulensi.updated_at).toLocaleDateString('id-ID')}`)
            .font('Helvetica-Bold')
            .text('Tanggal Diterbitkan: ', { continued: true })
            .font('Helvetica')
            .text(`${notulensi.published_at ? new Date(notulensi.published_at).toLocaleDateString('id-ID') : '-'}`)
            .moveDown();

        // Dokumentasi Terkait (Dari tabel Dokumentasi)
        doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .fillColor('#154360')
            .text('Dokumentasi Terkait', { underline: true })
            .moveDown(0.5);
        doc.font('Helvetica').fillColor('black');
        if (notulensi.dokumentasi && notulensi.dokumentasi.length > 0) {
            notulensi.dokumentasi.forEach((docItem, i) => {
                const url = `${req.protocol}://${req.get('host')}${docItem.path_file}`;
                doc.text(`${i + 1}. ${docItem.nama_file} [Lihat](${url})`, { link: url, underline: true });
            });
        } else {
            doc.text('Tidak ada dokumentasi terkait.');
        }

        // Footer
        doc.moveDown(2);
        doc
            .fontSize(10)
            .fillColor('#7B7D7D')
            .text('---', { align: 'center' })
            .text('SERASI - Sistem Notulensi Rapat', { align: 'center' });

        doc.end(); // Menutup stream PDF
        console.log('Notulensi berhasil diekspor sebagai PDF.');

    } catch (error) {
        console.error('ERROR di exportNotulensi:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal mengekspor notulensi.');
        next(error);
    }
};

exports.createNotulensiDraft = async (req, res, next) => {
    const { isi_notulen, deskripsi, rapatId } = req.body;
    const userId = req.session.user ? req.session.user.id_pengguna : 1;

    try {
        console.log('Memulai createNotulensiDraft...');
        const newDraft = await prisma.notulen_Rapat.create({
            data: {
                id_rapat: parseInt(rapatId),
                isi_notulen: isi_notulen || '',
                deskripsi: deskripsi || '',
                status: 'draft',
                created_by: userId,
                published_at: null,
            }
        });
        console.log('Draft notulensi berhasil dibuat:', newDraft.id_notulen);
        req.flash('success', 'Draft notulensi berhasil disimpan.');
        res.redirect('/draft'); // arahkan ke halaman draft
    } catch (error) {
        console.error('ERROR di createNotulensiDraft:', error);
        console.error(error.stack);
        req.flash('error', 'Gagal menyimpan draft notulensi.');
        next(error);
    }
};