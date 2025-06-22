-- CreateTable
CREATE TABLE `Dokumentasi` (
    `id_dokumentasi` INTEGER NOT NULL AUTO_INCREMENT,
    `id_notulen` INTEGER NOT NULL,
    `nama_file` VARCHAR(191) NOT NULL,
    `path_file` VARCHAR(191) NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_dokumentasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dokumentasi` ADD CONSTRAINT `Dokumentasi_id_notulen_fkey` FOREIGN KEY (`id_notulen`) REFERENCES `Notulen_Rapat`(`id_notulen`) ON DELETE RESTRICT ON UPDATE CASCADE;
