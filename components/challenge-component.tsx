"use client";

import useDailyChallenge from "@/hooks/use-daily-challenge";
import WavePlayer from "./wave-player";
import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Challenge() {
  const { challenge, timeToNextChallenge, isLoading, error } =
    useDailyChallenge();

  const { hrsStr, minsStr, secsStr } = formatTime(timeToNextChallenge);

  if (isLoading) return <p>Loading...</p>;

  if (error) {
    return <p>No challenge was found</p>;
  }

  return (
    <section>
      <div>
        <p className=" font-medium">
          Next challenge unlocks in:{" "}
          <span className="text-neutral-700 w-fit rounded p-2 bg-indigo-100 ">
            {hrsStr}
          </span>
          :
          <span className="text-neutral-700 w-fit rounded p-2 bg-indigo-100 ">
            {minsStr}
          </span>
          :
          <span className="text-neutral-700 w-fit rounded p-2 bg-indigo-100 ">
            {secsStr}
          </span>
        </p>
      </div>
      <h2>{challenge?.title}</h2>

      <WavePlayer challenge={challenge} />
    </section>
  );
}
