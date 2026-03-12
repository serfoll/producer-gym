"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

const SERVER_TIME_TRESHOLD = 3600000 * 2; // 1hr in milliseconds

export default function CountDownTimer({
  nextChallengeAtUTC,
  getServerNowAction: getServerNow,
}: {
  nextChallengeAtUTC: Date;
  getServerNowAction: () => number;
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const next = new Date(nextChallengeAtUTC).getTime();

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
