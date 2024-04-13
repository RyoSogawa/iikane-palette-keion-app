/*
  Warnings:

  - Added the required column `type` to the `MyBestSong` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SongType" AS ENUM ('track', 'album');

-- AlterTable
ALTER TABLE "MyBestSong" ADD COLUMN     "type" "SongType" NOT NULL;
