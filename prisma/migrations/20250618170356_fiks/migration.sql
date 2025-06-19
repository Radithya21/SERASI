-- DropForeignKey
ALTER TABLE `peserta_rapat` DROP FOREIGN KEY `Peserta_Rapat_id_pengguna_fkey`;

-- DropForeignKey
ALTER TABLE `peserta_rapat` DROP FOREIGN KEY `Peserta_Rapat_id_rapat_fkey`;

-- DropIndex
DROP INDEX `Peserta_Rapat_id_pengguna_fkey` ON `peserta_rapat`;

-- AddForeignKey
ALTER TABLE `Peserta_Rapat` ADD CONSTRAINT `Peserta_Rapat_id_rapat_fkey` FOREIGN KEY (`id_rapat`) REFERENCES `Rapat`(`id_rapat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peserta_Rapat` ADD CONSTRAINT `Peserta_Rapat_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `Pengguna`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;
