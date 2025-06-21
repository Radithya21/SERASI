/*
  Warnings:

  - Added the required column `path_file` to the `Dokumen_Rapat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dokumen_rapat` ADD COLUMN `path_file` VARCHAR(255) NOT NULL;
