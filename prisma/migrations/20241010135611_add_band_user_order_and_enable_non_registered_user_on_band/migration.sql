-- AlterTable
ALTER TABLE "UserOnBand" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userName" TEXT,
ADD COLUMN     "part" TEXT;
