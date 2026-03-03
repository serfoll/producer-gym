/*
  Warnings:

  - You are about to drop the column `referenceBlobUrl` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `referenceDuration` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `keySocre` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `referenceFeatures` on the `Submission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[challengeId,username]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blobUrl` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Made the column `bpm` on table `Challenge` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `Challenge` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `keyScore` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionFeatures` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Submission_challengeId_overallScore_idx";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "referenceBlobUrl",
DROP COLUMN "referenceDuration",
ADD COLUMN     "blobUrl" TEXT NOT NULL,
ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "bpm" SET NOT NULL,
ALTER COLUMN "key" SET NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "keySocre",
DROP COLUMN "referenceFeatures",
ADD COLUMN     "keyScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "submissionFeatures" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Submission_challengeId_overallScore_createdAt_idx" ON "Submission"("challengeId", "overallScore" DESC, "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_challengeId_username_key" ON "Submission"("challengeId", "username");
