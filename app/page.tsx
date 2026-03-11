import { format } from "date-fns";
import { WavePlayer } from "@/components";
import prisma from "@/lib/services/prisma";
import { ChallengeResponse } from "@/lib/types";

export default async function Home() {
  const today = format(new Date(), "yyyy-MM-dd'T00:00:00.000Z'");

  const challenge = await prisma.challenge.findUnique({
    where: { activeDate: today },
  });

  if (!challenge)
    return <div>No challenge challenge available at the moment!</div>;
  const submissions = await prisma.submission.findMany({
    where: { challengeId: challenge?.id },
  });

  return (
    <main>
      <h1>Today's Challenge: {challenge?.title}</h1>
      <WavePlayer challenge={challenge} />
      {/*Leaderboard goes here*/}
      <aside>
        <section>
          <h2>Leaderboard</h2>
          <ul>
            {submissions.map((submission, idx) => {
              if (idx > 10) return null;
              return (
                <li key={submission.id} className="flex gap-4">
                  <span className="font-bold">{submission.username}:</span>
                  <span>{submission.overallScore}%</span>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    </main>
  );
}
