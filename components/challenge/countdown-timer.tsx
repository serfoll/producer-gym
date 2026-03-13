//countdown-timer.tsx

"use client";

import { useEffect, useState } from "react";
import { useDailyChallengeQuery } from "@/hooks/use-daily-challenge-query";
import { formatTime } from "@/lib/utils";
import TimerPair from "./timer-pair";

const SERVER_TIME_TRESHOLD = 3600000 * 2; // 1hr in milliseconds

export default function CountDownTimer() {
  const { data, getServerNow } = useDailyChallengeQuery();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!data) return;
    const next = new Date(data.nextChallengeAtUTC).getTime();

    const updateTimer = () => {
      const clientNow = Date.now();
      const clientRemaining = next - clientNow;

      const serverNow = getServerNow();
      const serverRemaining = next - serverNow;

      const clientDay = new Date(clientNow).getUTCDate();
      const utcDay = new Date().getUTCDate();

      let remaining: number;

      if (clientRemaining <= SERVER_TIME_TRESHOLD) {
        remaining = serverRemaining;
      } else if (clientDay > utcDay) {
        remaining = serverRemaining;
      } else {
        remaining = clientRemaining;
      }

      setTimeLeft(Math.max(0, remaining));
    };
    updateTimer();

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [data, getServerNow]);

  const { hrsStr, minsStr, secsStr } = formatTime(timeLeft);
  return (
    <div className="flex items-center gap-1 bg-neutral-400 p-2 rounded-md w-fit mx-auto">
      <TimerPair timerStr={hrsStr} />
      <span className="font-semibold text-indigo-100 text-xl">:</span>
      <TimerPair timerStr={minsStr} />
      <span className="font-semibold text-indigo-100 text-xl">:</span>
      <TimerPair timerStr={secsStr} />
    </div>
  );
}
