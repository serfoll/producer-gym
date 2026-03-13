//challenge-component.tsx
"use client";

import WavePlayer from "../wave-player";
import { useDailyChallengeQuery } from "@/hooks/use-daily-challenge-query";
import type { ChallengeResponse } from "@/lib/challenge-types";
import UpcomingCard from "./upcoming-card";

export default function Challenge() {
  const { data, todayChallenge, isLoading, error } = useDailyChallengeQuery();

  if (isLoading) return <p>Fetching challenges...</p>;

  if (error || !data) {
    return <p>No challenge was found</p>;
  }

  const { challenges } = data;

  return (
    <section>
      <h2 className="font-bold text-xl md:text-2xl">Daily Challenges</h2>
      <p className="text-neutral-300">
        New challenge everyday for you to test yourself.
      </p>
      <div>
        {/*List of challenges goes here*/}
        <UpcomingCard />
      </div>
      <WavePlayer challenge={todayChallenge as ChallengeResponse} />
    </section>
  );
}
