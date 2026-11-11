-- CreateEnum
CREATE TYPE "JamSessionPart" AS ENUM ('vocal', 'guitar', 'bass', 'drums', 'keyboard', 'wind', 'strings', 'percussion', 'other');

-- CreateTable
CREATE TABLE "JamSessionSong" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proposerId" TEXT,
    "spotifyId" TEXT,
    "name" TEXT,
    "artist" TEXT,
    "playedAt" TIMESTAMP(3),

    CONSTRAINT "JamSessionSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamSessionEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "songId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "part" "JamSessionPart" NOT NULL,
    "partNote" TEXT,

    CONSTRAINT "JamSessionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamSessionParticipant" (
    "userId" TEXT NOT NULL,
    "parts" "JamSessionPart"[],
    "partNote" TEXT,
    "roots" TEXT[],
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "JamSessionParticipant_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "JamSessionSong_spotifyId_key" ON "JamSessionSong"("spotifyId");

-- CreateIndex
CREATE INDEX "JamSessionEntry_userId_idx" ON "JamSessionEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JamSessionEntry_songId_userId_part_key" ON "JamSessionEntry"("songId", "userId", "part");

-- AddForeignKey
ALTER TABLE "JamSessionSong" ADD CONSTRAINT "JamSessionSong_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamSessionEntry" ADD CONSTRAINT "JamSessionEntry_songId_fkey" FOREIGN KEY ("songId") REFERENCES "JamSessionSong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamSessionEntry" ADD CONSTRAINT "JamSessionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamSessionParticipant" ADD CONSTRAINT "JamSessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- 本番の既存テーブルと同じく RLS を有効にし、ポリシーは置かない（アクセスはサーバーの Prisma からだけ）
ALTER TABLE "JamSessionSong" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JamSessionEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JamSessionParticipant" ENABLE ROW LEVEL SECURITY;
