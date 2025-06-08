-- CreateTable
CREATE TABLE `Pengguna` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `nip` VARCHAR(20) NULL,
    `jabatan` VARCHAR(100) NULL,
    `departemen` VARCHAR(100) NULL,
    `telepon` VARCHAR(15) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pengguna_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(200) NOT NULL,
    `deskripsi` TEXT NULL,
    `tanggal` DATE NOT NULL,
    `waktu_mulai` TIME(0) NOT NULL,
    `waktu_selesai` TIME(0) NOT NULL,
    `tempat` VARCHAR(200) NOT NULL,
    `agenda` TEXT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'dijadwalkan',
    `created_by` INTEGER NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Peserta_Rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` INTEGER NOT NULL,
    `pengguna_id` INTEGER NOT NULL,
    `status_kehadiran` VARCHAR(50) NOT NULL DEFAULT 'belum_konfirmasi',
    `keterangan` VARCHAR(200) NULL,
    `waktu_absen` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_peserta_rapat_rapat`(`rapat_id`),
    INDEX `idx_peserta_rapat_pengguna`(`pengguna_id`),
    UNIQUE INDEX `Peserta_Rapat_rapat_id_pengguna_id_key`(`rapat_id`, `pengguna_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notulen_Rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` INTEGER NOT NULL,
    `isi_notulen` LONGTEXT NOT NULL,
    `kesimpulan` TEXT NULL,
    `tindak_lanjut` TEXT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `created_by` INTEGER NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `published_at` TIMESTAMP NULL,

    INDEX `idx_notulen_rapat_rapat`(`rapat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dokumen_Rapat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` INTEGER NOT NULL,
    `nama_file` VARCHAR(255) NOT NULL,
    `nama_asli` VARCHAR(255) NOT NULL,
    `path_file` VARCHAR(500) NOT NULL,
    `ukuran_file` INTEGER NOT NULL,
    `tipe_file` VARCHAR(50) NOT NULL,
    `jenis_dokumen` VARCHAR(50) NOT NULL DEFAULT 'draft',
    `deskripsi` TEXT NULL,
    `uploaded_by` INTEGER NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_dokumen_rapat_rapat`(`rapat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengumuman` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(200) NOT NULL,
    `isi_pengumuman` TEXT NOT NULL,
    `rapat_id` INTEGER NULL,
    `prioritas` VARCHAR(50) NOT NULL DEFAULT 'sedang',
    `status` VARCHAR(50) NOT NULL DEFAULT 'aktif',
    `created_by` INTEGER NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_pengumuman_created_at`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tindak_Lanjut` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapat_id` INTEGER NOT NULL,
    `deskripsi_aksi` TEXT NOT NULL,
    `pic_pengguna_id` INTEGER NOT NULL,
    `target_tanggal` DATE NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'belum_mulai',
    `keterangan` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log_Aktivitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pengguna_id` INTEGER NOT NULL,
    `aktivitas` VARCHAR(200) NOT NULL,
    `deskripsi` TEXT NULL,
    `tabel_terdampak` VARCHAR(50) NULL,
    `record_id` INTEGER NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_log_aktivitas_pengguna_created`(`pengguna_id`, `created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rapat` ADD CONSTRAINT `Rapat_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peserta_Rapat` ADD CONSTRAINT `Peserta_Rapat_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `Rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peserta_Rapat` ADD CONSTRAINT `Peserta_Rapat_pengguna_id_fkey` FOREIGN KEY (`pengguna_id`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notulen_Rapat` ADD CONSTRAINT `Notulen_Rapat_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `Rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notulen_Rapat` ADD CONSTRAINT `Notulen_Rapat_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dokumen_Rapat` ADD CONSTRAINT `Dokumen_Rapat_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `Rapat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dokumen_Rapat` ADD CONSTRAINT `Dokumen_Rapat_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengumuman` ADD CONSTRAINT `Pengumuman_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `Rapat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengumuman` ADD CONSTRAINT `Pengumuman_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tindak_Lanjut` ADD CONSTRAINT `Tindak_Lanjut_rapat_id_fkey` FOREIGN KEY (`rapat_id`) REFERENCES `Rapat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tindak_Lanjut` ADD CONSTRAINT `Tindak_Lanjut_pic_pengguna_id_fkey` FOREIGN KEY (`pic_pengguna_id`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log_Aktivitas` ADD CONSTRAINT `Log_Aktivitas_pengguna_id_fkey` FOREIGN KEY (`pengguna_id`) REFERENCES `Pengguna`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
