import prisma from "@/lib/services/prisma";
import { format, addDays, startOfDay } from "date-fns";

export default async function Home() {
  const today = format(new Date(), "yyyy-MM-dd'T00:00:00.000Z'");

  const challenge = await prisma.challenge.findUnique({
    where: { activeDate: today, isActive: true },
  });

  const submissions = await prisma.submission.findMany({
    where: { challengeId: challenge?.id },
  });

  return (
    <main>
      <h1>Today's Challenge: Mellow Choards</h1>
      <audio src={challenge?.blobUrl} autoPlay controls>
        <track default kind="captions" />
      </audio>
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
