"use client";

import WavePlayer from "../wave-player";
import { useDailyChallengeQuery } from "@/hooks/use-daily-challenge-query";
import type { DailyChallengeResponse } from "@/lib/challenge-types";
import CountDownTimer from "./conutdown-timer";

export default function Challenge() {
  const { data, isLoading, error, getServerNow } = useDailyChallengeQuery();

  if (isLoading) return <p>Fetching challenges...</p>;

  if (error) {
    return <p>No challenge was found</p>;
  }

  const { nextChallengeAtUTC, challenge }: DailyChallengeResponse =
    data as DailyChallengeResponse;

  return (
    <section>
      <h2>Today's challenge: {challenge?.title}</h2>
      <CountDownTimer
        nextChallengeAtUTC={nextChallengeAtUTC}
        getServerNow={getServerNow}
      />
      <WavePlayer challenge={challenge} />
    </section>
  );
}
