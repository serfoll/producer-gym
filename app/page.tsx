import { anaylizeAndExtractAudioFeatures } from "@/lib/audio-analyzer";
import prisma from "@/lib/services/prisma";

export default async function Home() {
  const challenges = await prisma.challenge.findMany();
  const tempBlobUrl =
    "https://prgymstorage.blob.core.windows.net/dev/3900ebf21a0373178c6ea00b20b9c3c9cae6d9b2a3e7043a0496895b87f2bc33";
  const features = await anaylizeAndExtractAudioFeatures(tempBlobUrl);

  console.log(`anaylizeAndExtractAudioFeatures: ${features}`);

  return (
    <main>
      <h1>Today's Challenge: {challenges[0].title}</h1>
      <audio src={challenges[0].blobUrl} autoPlay controls>
        <track default kind="captions" />
      </audio>
    </main>
  );
}
