import { anaylizeAndExtractAudioFeatures } from "@/lib/audio-analyzer";
import prisma from "@/lib/services/prisma";

export default async function Home() {
  const challenges = await prisma.challenge.findMany();
  const tempBlobUrl =
    "https://prgymstorage.blob.core.windows.net/dev/35914a0035a50c7efd6f2fd0012cd4a3c809b498a1dd4843ef7ddfd1db8a4caf";
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
