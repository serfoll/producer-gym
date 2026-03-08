import { anaylizeAndExtractAudioFeatures } from "@/lib/audio-analyzer";
import { submissionScore } from "@/lib/calculate-score";
import prisma from "@/lib/services/prisma";

const capitaliseScoreKeyString = (key: string): string => {
  const keyStr = key.split("Score")[0];
  return keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
};

export default async function Home() {
  const challenges = await prisma.challenge.findMany();
  const tempBlobUrl =
    "https://prgymstorage.blob.core.windows.net/dev/3900ebf21a0373178c6ea00b20b9c3c9cae6d9b2a3e7043a0496895b87f2bc33";
  const tempSubUrl =
    "https://prgymstorage.blob.core.windows.net/dev/91e0cb6b4df553ace020c29861489f731ccd1ffc782ed5b39b5cfe3f9fd7280b";

  const features = await anaylizeAndExtractAudioFeatures(tempBlobUrl);
  const featuresSub = await anaylizeAndExtractAudioFeatures(tempSubUrl);

  const scoreSameSame = submissionScore(features, features);
  const scoreDiff = submissionScore(features, featuresSub);

  return (
    <main>
      <h1>Today's Challenge: {challenges[0].title}</h1>
      <audio src={challenges[0].blobUrl} autoPlay controls>
        <track default kind="captions" />
      </audio>
      <h2>Your Score: {scoreSameSame.overallScore}%</h2>
      <ul>
        {Object.keys(scoreSameSame).map((key) => (
          <li key={`sub-${key}`}>
            {capitaliseScoreKeyString(key)} Math: {scoreSameSame[key]}
          </li>
        ))}
      </ul>

      <h2>Different Tracks Score: {scoreDiff.overallScore}%</h2>
      <ul>
        {Object.keys(scoreDiff).map((key) => (
          <li key={`sub-${key}`}>
            {capitaliseScoreKeyString(key)} Math: {scoreDiff[key]}
          </li>
        ))}
      </ul>
    </main>
  );
}
