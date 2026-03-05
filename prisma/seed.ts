import { type Prisma, PrismaClient } from "@/app/generated/prisma/client";
import {
  createContainer,
  createServiceClient,
  uploadBlobFromLocalPath,
} from "@/lib/services/azure";
import { createBlobFromLocalFile } from "@/lib/utils";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const challengeData: Prisma.ChallengeCreateInput[] = [
  {
    title: "Mellow chords",
    blobUrl: "",
    duration: 16,
    bpm: 120,
    key: "D major",
    referenceFeatures: {
      tempo: {
        bpm: 2812.5,
        confidence: 0.9247,
      },
      key: {
        estimatedKey: "D",
        mode: "major",
        confidence: 0.5,
      },
      energy: {
        rmsMean: 0.2172,
        rmsStd: 0.0569,
        envelope: [
          0.7438, 0.9495, 0.8436, 0.8654, 1.0, 0.6076, 0.7051, 0.2544, 0.9276,
          0.9212, 0.7088, 0.8565, 0.9864, 0.8012, 0.3278,
        ],
      },
      rhythm: {
        onsetDensity: 5.5,
        onsetEnvelope: [
          1.0, 0.4043, 0.1565, 0.1609, 0.1336, 0.1838, 0.0, 0.7978, 0.0098,
          0.6236, 0.5054, 0.506, 0.3209, 0.198, 0.3412,
        ],
      },
      spectral: {
        centroidMean: 1610.16,
        centroidStd: 762.55,
      },
      duration: 16.0,
      sampleRate: 48000,
      analysisVersion: "v1",
    },
    activeDate: new Date(Date.UTC(2026, 2, 3, 0, 0, 0)),
    isActive: true,
    submissions: {
      create: [
        {
          blobUrl: "",
          duration: 20,
          submissionFeatures: {},
          username: "seru.jou",
          overallScore: 0.6,
          tempoScore: 0.53,
          keyScore: 0.3,
          rhythmScore: 0.4,
          energyScore: 0.7,
        },
      ],
    },
  },
];

export async function main() {
  for (const c of challengeData) {
    const blobUrl = await createBlobFromLocalFile("./audio/challenge.wav");
    c.blobUrl = blobUrl;
    await prisma.challenge.create({ data: c });
  }
}

main();
