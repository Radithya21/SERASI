const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tampilkan semua notulensi yang berstatus draft
const getDraftList = async (req, res) => {
  try {
    const drafts = await prisma.notulen_Rapat.findMany({
      where: { status: 'draft' },
      include: { rapat: true },
      orderBy: { updated_at: 'desc' }
    });
    res.render('draft/draft', {
      title: 'Draft Notulensi',
      drafts, // variabel ini harus dipakai di EJS
      success_msg: req.flash('success'),
      error_msg: req.flash('error')
    });
  } catch (error) {
    console.error('Error mengambil draft:', error);
    req.flash('error', 'Terjadi kesalahan saat mengambil draft');
    res.redirect('/');
  }
};

// Tampilkan form edit draft
const editNotulensiForm = async (req, res) => {
  const { id } = req.params;
  try {
    const draft = await prisma.notulen_Rapat.findUnique({
      where: { id_notulen: parseInt(id) },
      include: { rapat: true }
    });
    if (!draft) {
      req.flash('error', 'Draft tidak ditemukan');
      return res.redirect('/draft');
    }
    res.render('draft/edit', {
      title: 'Edit Draft Notulensi',
      draft,
      success_msg: req.flash('success'),
      error_msg: req.flash('error')
    });
  } catch (error) {
    console.error('Error saat membuka form edit:', error);
    req.flash('error', 'Terjadi kesalahan saat membuka form edit');
    res.redirect('/draft');
  }
};

// Update isi deskripsi draft notulensi
const updateNotulensi = async (req, res) => {
  const { id } = req.params;
  const { deskripsi } = req.body;
  try {
    await prisma.notulen_Rapat.update({
      where: { id_notulen: parseInt(id) },
      data: { deskripsi },
    });
    req.flash('success', 'Draft berhasil diperbarui');
    res.redirect('/draft');
  } catch (error) {
    console.error('Error saat update notulensi:', error);
    req.flash('error', 'Gagal memperbarui draft');
    res.redirect('/draft');
  }
};

// Upload (publish) draft menjadi notulensi final
const uploadNotulensi = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notulen_Rapat.update({
      where: { id_notulen: parseInt(id) },
      data: {
        status: 'uploaded',
        published_at: new Date(),
      },
    });
    req.flash('success', 'Draft berhasil diunggah');
    res.redirect('/draft');
  } catch (error) {
    console.error('Error saat upload notulensi:', error);
    req.flash('error', 'Gagal mengupload notulensi');
    res.redirect('/draft');
  }
};

// Hapus draft notulensi
const deleteNotulensi = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notulen_Rapat.delete({
      where: { id_notulen: parseInt(id) },
    });
    req.flash('success', 'Draft berhasil dihapus');
    res.redirect('/draft');
  } catch (error) {
    console.error('Error saat menghapus draft:', error);
    req.flash('error', 'Gagal menghapus draft');
    res.redirect('/draft');
  }
};

module.exports = {
  getDraftList,
  editNotulensiForm,
  updateNotulensi,
  uploadNotulensi,
  deleteNotulensi,
};
