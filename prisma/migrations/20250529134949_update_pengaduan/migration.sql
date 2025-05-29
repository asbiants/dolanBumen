/*
  Warnings:

  - You are about to drop the column `content` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the column `response_date` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `complaints` table. All the data in the column will be lost.
  - Added the required column `deskripsi` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenis` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `narahubung` to the `complaints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "content",
DROP COLUMN "response_date",
DROP COLUMN "subject",
ADD COLUMN     "deskripsi" TEXT NOT NULL,
ADD COLUMN     "jenis" TEXT NOT NULL,
ADD COLUMN     "latitude" TEXT NOT NULL,
ADD COLUMN     "longitude" TEXT NOT NULL,
ADD COLUMN     "narahubung" TEXT NOT NULL,
ADD COLUMN     "responseDate" TIMESTAMP(3);
