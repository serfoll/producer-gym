-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "referenceBlobUrl" TEXT NOT NULL,
    "referenceDuration" DOUBLE PRECISION NOT NULL,
    "bpm" DOUBLE PRECISION NOT NULL,
    "key" TEXT NOT NULL,
    "referenceFeatures" JSONB NOT NULL,
    "activeDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "username" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "tempoScore" DOUBLE PRECISION NOT NULL,
    "keySocre" DOUBLE PRECISION NOT NULL,
    "rhythmScore" DOUBLE PRECISION NOT NULL,
    "energyScore" DOUBLE PRECISION NOT NULL,
    "processingTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_activeDate_key" ON "Challenge"("activeDate");

-- CreateIndex
CREATE INDEX "Submission_challengeId_overallScore_idx" ON "Submission"("challengeId", "overallScore" DESC);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
