import { anaylizeAndExtractAudioFeatures } from "@/lib/audio-analyzer";
import { submissionScore } from "@/lib/calculate-score";
import prisma from "@/lib/services/prisma";

const capitaliseScoreKeyString = (key: string): string => {
  const keyStr = key.split("Score")[0];
  return keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
};

export default async function Home() {
  const challenges = await prisma.challenge.findMany();

  return (
    <main>
      <h1>Today's Challenge: {challenges[0].title}</h1>
      <audio src={challenges[0].blobUrl} autoPlay controls>
        <track default kind="captions" />
      </audio>
    </main>
  );
}
