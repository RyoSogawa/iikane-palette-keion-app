-- Discord 未登録の人を User なしでバンドメンバーに入れるため、userId を主キーから外して null を許す。
-- 既存の行にも id が要るので、列を足して埋めてから NOT NULL にする
ALTER TABLE "UserOnBand" ADD COLUMN "id" TEXT;
UPDATE "UserOnBand" SET "id" = gen_random_uuid()::text;
ALTER TABLE "UserOnBand" ALTER COLUMN "id" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserOnBand" DROP CONSTRAINT "UserOnBand_pkey",
ALTER COLUMN "userId" DROP NOT NULL,
ADD CONSTRAINT "UserOnBand_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnBand_userId_bandId_key" ON "UserOnBand"("userId", "bandId");
