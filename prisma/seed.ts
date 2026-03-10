import { type Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { anaylizeAndExtractAudioFeatures } from "@/lib/audio-analyzer";
import { submissionScore as getsSubmissionScore } from "@/lib/calculate-score";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  const challengeBlobUrl =
    "https://prgymstorage.blob.core.windows.net/dev/3900ebf21a0373178c6ea00b20b9c3c9cae6d9b2a3e7043a0496895b87f2bc33";
  const challengeFeatures =
    await anaylizeAndExtractAudioFeatures(challengeBlobUrl);
  const subBlobUrl =
    "https://prgymstorage.blob.core.windows.net/dev/91e0cb6b4df553ace020c29861489f731ccd1ffc782ed5b39b5cfe3f9fd7280b";
  const submissionFeatures = await anaylizeAndExtractAudioFeatures(subBlobUrl);

  const score = getsSubmissionScore(challengeFeatures, submissionFeatures);

  const challengeData: Prisma.ChallengeCreateInput[] = [
    {
      title: "Mellow chords",
      blobUrl: challengeBlobUrl,
      duration: 16,
      referenceFeatures: challengeFeatures,
      activeDate: new Date(Date.UTC(2026, 2, 3, 0, 0, 0)),
      isActive: true,
      submissions: {
        create: [
          {
            blobUrl: subBlobUrl,
            duration: 20,
            referenceFeatures: submissionFeatures,
            username: "seru.jou",
            tempoScore: score.tempoScore,
            keyScore: score.keyScore,
            rhythmScore: score.rhythmScore,
            dynamicsScore: score.dynamicsScore,
            spectralScore: score.spectralScore,
            structureScore: score.structureScore,
            overallScore: score.overallScore,
          },
        ],
      },
    },
  ];

  for (const c of challengeData) {
    await prisma.challenge.create({ data: c });
  }
}

main();
