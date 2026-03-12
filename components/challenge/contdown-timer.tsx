"use client";

import { useDailyChallengeQuery } from "@/hooks/use-daily-challenge-query";
import { formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

const ONE_HOUR = 3600000; // 1hr in milliseconds

export default function CountDownTimer({
  nextChallengeAtUTC,
}: {
  nextChallengeAtUTC: Date;
}) {
  const { getServerNow } = useDailyChallengeQuery();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const next = new Date(nextChallengeAtUTC).getTime();

    const updateTimer = () => {
      const clientNow = Date.now();
      const clientRemaining = next - clientNow;

      const serverNow = getServerNow();
      const serverRemaining = next - serverNow;

      const clientDate = new Date(clientNow).getDate();
      const utcDate = new Date().getUTCDate();

      let remaining: number;

      if (clientRemaining <= ONE_HOUR) {
        remaining = serverRemaining;
      } else if (clientDate > utcDate) {
        remaining = serverRemaining;
      } else {
        remaining = clientRemaining;
      }

      setTimeLeft(Math.max(0, remaining));
    };
    updateTimer();

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [nextChallengeAtUTC, getServerNow]);

  const { hrsStr, minsStr, secsStr } = formatTime(timeLeft);
  return (
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
  );
}
