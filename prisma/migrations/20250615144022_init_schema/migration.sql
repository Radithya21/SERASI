-- CreateTable
CREATE TABLE `Pengguna` (
    `id_pengguna` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `nip` VARCHAR(20) NULL,
    `telepon` VARCHAR(15) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pengguna_email_key`(`email`),
    PRIMARY KEY (`id_pengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rapat` (
    `id_rapat` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(200) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `waktu_mulai` DATETIME(3) NOT NULL,
    `waktu_selesai` DATETIME(3) NOT NULL,
    `tempat` VARCHAR(200) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deskripsi` TEXT NULL,

    PRIMARY KEY (`id_rapat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Peserta_Rapat` (
    `id_rapat` INTEGER NOT NULL,
    `id_pengguna` INTEGER NOT NULL,
    `status_kehadiran` VARCHAR(50) NOT NULL,
    `waktu_absen` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_rapat`, `id_pengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notulen_Rapat` (
    `id_notulen` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rapat` INTEGER NOT NULL,
    `isi_notulen` LONGTEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `published_at` DATETIME(3) NULL,

    UNIQUE INDEX `Notulen_Rapat_id_rapat_key`(`id_rapat`),
    PRIMARY KEY (`id_notulen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dokumen_Rapat` (
    `id_dokumen` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rapat` INTEGER NOT NULL,
    `nama_file` VARCHAR(255) NOT NULL,
    `ukuran_file` INTEGER NOT NULL,
    `tipe_file` VARCHAR(50) NOT NULL,
    `uploaded_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_dokumen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengumuman` (
    `id_pengumuman` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rapat` INTEGER NULL,
    `judul` VARCHAR(200) NOT NULL,
    `isi_pengumuman` TEXT NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_pengumuman`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rapat` ADD CONSTRAINT `Rapat_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peserta_Rapat` ADD CONSTRAINT `Peserta_Rapat_id_rapat_fkey` FOREIGN KEY (`id_rapat`) REFERENCES `Rapat`(`id_rapat`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peserta_Rapat` ADD CONSTRAINT `Peserta_Rapat_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notulen_Rapat` ADD CONSTRAINT `Notulen_Rapat_id_rapat_fkey` FOREIGN KEY (`id_rapat`) REFERENCES `Rapat`(`id_rapat`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notulen_Rapat` ADD CONSTRAINT `Notulen_Rapat_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dokumen_Rapat` ADD CONSTRAINT `Dokumen_Rapat_id_rapat_fkey` FOREIGN KEY (`id_rapat`) REFERENCES `Rapat`(`id_rapat`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dokumen_Rapat` ADD CONSTRAINT `Dokumen_Rapat_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengumuman` ADD CONSTRAINT `Pengumuman_id_rapat_fkey` FOREIGN KEY (`id_rapat`) REFERENCES `Rapat`(`id_rapat`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengumuman` ADD CONSTRAINT `Pengumuman_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;
