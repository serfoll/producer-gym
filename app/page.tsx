import { anaylizeAndExtractAudioFeatures } from "@/lib/audio-analyzer";
import { submissionScore } from "@/lib/calculate-score";
import prisma from "@/lib/services/prisma";
//import prisma from "@/lib/services/prisma";

export default async function Home() {
  const challenge = await prisma.challenge.findFirst();

  return (
    <main>
      <h1>Today's Challenge: Mellow Choards</h1>
      <audio src={challenge?.blobUrl} autoPlay controls>
        <track default kind="captions" />
      </audio>
    </main>
  );
}
