-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "movie" TEXT,
    "driveLink" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Band" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "liveOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "image" TEXT,
    "typoImage" TEXT,
    "movie" TEXT,

    CONSTRAINT "Band_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnBand" (
    "userId" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,

    CONSTRAINT "UserOnBand_pkey" PRIMARY KEY ("userId","bandId")
);

-- AddForeignKey
ALTER TABLE "Band" ADD CONSTRAINT "Band_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBand" ADD CONSTRAINT "UserOnBand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBand" ADD CONSTRAINT "UserOnBand_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 実データ登録
INSERT INTO "Event" ("id", "updatedAt", "name", "description", "dateFrom","dateTo" , "image", "movie", "driveLink")
VALUES('202410-keion-gasshuku-4',
       CURRENT_TIMESTAMP,
       '第4回軽音合宿',
     '',
       '2024-10-08 00:00:00',
       '2024-10-09 00:00:00',
       '/images/event/202410/202410cover.webp',
       'https://www.youtube.com/embed/3--W9TLVxvM?si=i_m3lsKC5J4o2B40',
       'https://drive.google.com/drive/folders/1-08zuezQhET6SZsIxlvgiva-bBw8hJIk'
      );

INSERT INTO "Band" ("id", "eventId", "liveOrder", "name", "description", "photo", "image", "typoImage", "movie")
VALUES('oretachi-recchiri',
       '202410-keion-gasshuku-4',
       1,
       'おれたちレッチリ',
       '',
       '/images/event/202410/oretachi-recchiri-photo.webp',
       '',
       '/images/event/202410/oretachi-recchiri-typo.webp',
       'https://www.youtube.com/embed/N3SaUk-RAPs?si=qp2GzPGKdg2NgHFb'
      );

INSERT INTO "Band" ("id", "eventId", "liveOrder", "name", "description", "photo", "image", "typoImage", "movie")
VALUES('adrenaline',
       '202410-keion-gasshuku-4',
       2,
       '亜怒烈那燐',
       '',
       '/images/event/202410/adrenaline-photo.webp',
       '/images/event/202410/adrenaline.webp',
       '/images/event/202410/adrenaline-typo.webp',
       'https://www.youtube.com/embed/7a7CL-eHavc?si=85elvPvVEHV0lGI7'
      );

INSERT INTO "Band" ("id", "eventId", "liveOrder", "name", "description", "photo", "image", "typoImage", "movie")
VALUES('marian-jesus-cry',
       '202410-keion-gasshuku-4',
       3,
       'MARIA''N''JESUS CRY',
       '',
       '/images/event/202410/marian-jesus-cry-photo.webp',
       '/images/event/202410/marian-jesus-cry.webp',
       '/images/event/202410/marian-jesus-cry-typo.webp',
       'https://www.youtube.com/embed/rNqb5zR4C18?si=f7lE3uMBcI6zviyW'
      );


INSERT INTO "Band" ("id", "eventId", "liveOrder", "name", "description", "photo", "image", "typoImage", "movie")
VALUES('death-eaters',
       '202410-keion-gasshuku-4',
       4,
       'DEARTH EATERS',
       '',
       '/images/event/202410/death-eaters-photo.webp',
       '/images/event/202410/death-eaters.webp',
       '/images/event/202410/death-eaters-typo.webp',
       'https://www.youtube.com/embed/mTNBQQXBPvs?si=59iVPnwKHShdIlu6'
      );


INSERT INTO "Band" ("id", "eventId", "liveOrder", "name", "description", "photo", "image", "typoImage", "movie")
VALUES('fuwari',
       '202410-keion-gasshuku-4',
       5,
       'ふわり',
       '',
       '/images/event/202410/fuwari-photo.webp',
       '/images/event/202410/fuwari.webp',
       '/images/event/202410/fuwari-typo.webp',
       'https://www.youtube.com/embed/CnbVv4xsXms?si=MZiE3Ty7fMC5rWIg'
      );


INSERT INTO "Band" ("id", "eventId", "liveOrder", "name", "description", "photo", "image", "typoImage", "movie")
VALUES('zutt-kyun',
       '202410-keion-gasshuku-4',
       6,
       'ずっ(と)キュン♡',
       '',
       '/images/event/202410/zutt-kyun-photo.webp',
       '/images/event/202410/zutt-kyun.webp',
       '/images/event/202410/zutt-kyun-typo.webp',
       'https://www.youtube.com/embed/bjsntzaK1aM?si=kyVBoaE5qdShDYQH'
      );
