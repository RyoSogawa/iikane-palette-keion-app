/*
  Warnings:

  - You are about to drop the column `instagramLink` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitterLink` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable

UPDATE "User"
SET "twitterLink" = substring("twitterLink" from 'https://twitter.com/(.+)')
WHERE "twitterLink" LIKE 'https://twitter.com/%';

UPDATE "User"
SET "instagramLink" = substring("instagramLink" from 'https://www.instagram.com/(.+)')
WHERE "instagramLink" LIKE 'https://www.instagram.com/%';

-- 古いカラムを削除する
ALTER TABLE "User" RENAME COLUMN "twitterLink" TO "twitterUsername";
ALTER TABLE "User" RENAME COLUMN "instagramLink" TO "instagramUsername";
