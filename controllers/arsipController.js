// controllers/arsipController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getArsipRapat = async (req, res) => {
  try {
    const arsip = await prisma.notulen_Rapat.findMany({
      where: { status: 'uploaded' },
      orderBy: { published_at: 'desc' },
      include: {
        rapat: true,
      }
    });

    res.render('arsip/arsip', {
      title: 'Arsip Notulensi',
      arsip,
      success_msg: req.flash('success'),
      error_msg: req.flash('error'),
    });
  } catch (err) {
    console.error('Gagal mengambil arsip:', err);
    res.status(500).send('Gagal menampilkan arsip rapat');
  }
};

module.exports = {
  getArsipRapat,
};