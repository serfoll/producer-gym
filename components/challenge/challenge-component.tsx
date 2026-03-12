"use client";

import WavePlayer from "../wave-player";
import { useDailyChallengeQuery } from "@/hooks/use-daily-challenge-query";
import CountDownTimer from "./contdown-timer";
import type { DailyChallengeResponse } from "@/lib/challenge-types";

export default function Challenge() {
  const { data, isLoading, error } = useDailyChallengeQuery();

  if (isLoading) return <p>Fetching challenges...</p>;

  if (error) {
    return <p>No challenge was found</p>;
  }

  const { nextChallengeAtUTC, challenge }: DailyChallengeResponse =
    data as DailyChallengeResponse;

  return (
    <section>
      <h2>Today's challenge: {challenge?.title}</h2>
      <CountDownTimer nextChallengeAtUTC={nextChallengeAtUTC} />
      <WavePlayer challenge={challenge} />
    </section>
  );
}
