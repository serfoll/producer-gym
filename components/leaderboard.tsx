import prisma from "@/lib/services/prisma";
import { ChallengeResponse } from "@/lib/types";

export default async function Leaderboard({
  challenge,
}: {
  challenge: ChallengeResponse;
}) {
  const submissions = await prisma.submission.findMany({
    where: { challengeId: challenge?.id },
  });

  return (
    <section>
      <h2>Leaderboard</h2>
      <ul>
        {submissions.map((submission, idx: number) => {
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
  );
}
