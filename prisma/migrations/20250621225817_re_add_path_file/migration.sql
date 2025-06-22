/*
  Warnings:

  - You are about to alter the column `path_file` on the `dokumen_rapat` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `dokumen_rapat` MODIFY `path_file` VARCHAR(191) NOT NULL;
