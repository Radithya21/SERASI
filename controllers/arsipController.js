const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

// GET: Halaman daftar arsip rapat
const getArsipRapat = async (req, res) => {
  try {
    // Ambil parameter sort dari query, default 'desc' (terbaru)
    const sort = req.query.sort === 'asc' ? 'asc' : 'desc';
    const arsip = await prisma.notulen_Rapat.findMany({
      where: { status: 'uploaded' },
      orderBy: { published_at: sort },
      include: {
        rapat: true,
        dokumentasi: true
      }
    });

    res.render('arsip/arsip', {
      title: 'Arsip Notulensi',
      arsip,
      sort, // kirim ke view agar dropdown tetap sesuai
      success_msg: req.flash('success'),
      error_msg: req.flash('error')
    });
  } catch (err) {
    console.error('Gagal mengambil arsip:', err);
    res.status(500).send('Gagal menampilkan arsip rapat');
  }
};

// GET: Detail notulensi rapat berdasarkan ID
const getDetailNotulensi = async (req, res) => {
  const { id } = req.params;
  try {
    const notulen = await prisma.notulen_Rapat.findUnique({
      where: { id_notulen: parseInt(id) },
      include: {
        rapat: true,
        pengguna: true,
        dokumentasi: true
      }
    });
    // Ambil semua notulensi yang sudah diunggah (selain yang sedang dibuka)
    const notulensiLain = await prisma.notulen_Rapat.findMany({
      where: {
        status: 'uploaded',
        id_notulen: { not: parseInt(id) }
      },
      orderBy: { published_at: 'desc' },
      include: { rapat: true }
    });
    if (!notulen) {
      console.log('DEBUG: Notulen tidak ditemukan untuk id:', id);
      return res.render('arsip/detail', {
        title: 'Detail Notulensi',
        notulen: null,
        notulensiLain,
        success_msg: req.flash('success'),
        error_msg: 'Notulensi tidak ditemukan.'
      });
    }
    res.render('arsip/detail', {
      title: 'Detail Notulensi',
      notulen,
      notulensiLain,
      success_msg: req.flash('success'),
      error_msg: req.flash('error')
    });
  } catch (err) {
    console.error('Gagal mengambil detail notulensi:', err);
    req.flash('error', 'Terjadi kesalahan saat mengambil data.');
    res.redirect('/arsip');
  }
};

// GET: Dokumentasi berdasarkan ID notulen
const getDokumentasi = async (req, res) => {
  const { id } = req.params;

  try {
    const dokumentasi = await prisma.dokumentasi.findMany({
      where: { id_notulen: parseInt(id) }
    });

    res.render('arsip/dokumentasi', {
      title: 'Dokumentasi Rapat',
      dokumentasi,
      success_msg: req.flash('success'),
      error_msg: req.flash('error')
    });
  } catch (err) {
    console.error('Gagal mengambil dokumentasi:', err);
    req.flash('error', 'Tidak dapat memuat dokumentasi.');
    res.redirect('/arsip');
  }
};

// GET: Export PDF dari notulensi
const exportPDF = async (req, res) => {
  const { id } = req.params;

  try {
    const notulen = await prisma.notulen_Rapat.findUnique({
      where: { id_notulen: parseInt(id) },
      include: {
        rapat: true,
        pengguna: true,
        dokumentasi: true
      }
    });

    if (!notulen) {
      req.flash('error', 'Notulensi tidak ditemukan.');
      return res.redirect('/arsip');
    }

    const doc = new PDFDocument();
    const filename = `notulensi_rapat_${id}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Notulensi Rapat', { align: 'center' }).moveDown();

    doc.fontSize(12)
      .text(`Tanggal: ${new Date(notulen.rapat.tanggal).toLocaleDateString('id-ID')}`)
      .text(`Waktu: ${notulen.rapat.waktu || '10.00 WIB'}`)
      .text(`Tempat: ${notulen.rapat.tempat || '-'}`)
      .moveDown();

    doc.fontSize(12).text(`Deskripsi: ${notulen.deskripsi || '-'}`).moveDown();

    if (notulen.peserta?.length > 0) {
      doc.fontSize(14).text('Peserta:', { underline: true }).moveDown(0.5);
      notulen.peserta.forEach((p, i) => {
        doc.fontSize(12).text(`${i + 1}. ${p.nama}`);
      });
      doc.moveDown();
    }

    if (notulen.pembahasan?.length > 0) {
      doc.fontSize(14).text('Pembahasan:', { underline: true }).moveDown(0.5);
      notulen.pembahasan.forEach((p, i) => {
        doc.fontSize(12).text(`${i + 1}. ${p.topik}`);
      });
      doc.moveDown();
    }

    if (notulen.keputusan?.length > 0) {
      doc.fontSize(14).text('Keputusan:', { underline: true }).moveDown(0.5);
      notulen.keputusan.forEach((k, i) => {
        doc.fontSize(12).text(`${i + 1}. ${k.isi}`);
      });
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error('Gagal mengekspor PDF:', err);
    req.flash('error', 'Gagal mengekspor PDF.');
    res.redirect('/arsip');
  }
};

// Halaman notulensi sebelumnya (khusus page baru, admin)
const getArsipNotulensiSebelumnya = async (req, res) => {
  try {
    const notulensiLain = await prisma.notulen_Rapat.findMany({
      where: { status: 'uploaded' },
      orderBy: { published_at: 'desc' },
      include: { rapat: true }
    });
    res.render('arsip/sebelumnya', { title: 'Notulensi Sebelumnya', notulensiLain });
  } catch (error) {
    console.error('Error fetching notulensi sebelumnya:', error);
    req.flash('error', 'Gagal memuat notulensi sebelumnya.');
    res.redirect('/arsip');
  }
};

// Ekspor semua controller
module.exports = {
  getArsipRapat,
  getDetailNotulensi,
  getDokumentasi,
  exportPDF,
  getArsipNotulensiSebelumnya,
};
