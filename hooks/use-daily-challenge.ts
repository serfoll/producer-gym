"use client";

import { useEffect, useRef, useState } from "react";
import type { ChallengeResponse } from "@/lib/types";
import { getLocalTimeToNextChallenge } from "@/lib/utils";

export default function useDailyChallenge() {
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [timeToNextChallenge, setTimeToNextChallenge] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const unlockTimestampRef = useRef<number>(0);

  // timer refs
  const countDownIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // clear timers
  const clearTimers = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = undefined;
    }

    if (countDownIntervalRef.current) {
      clearInterval(countDownIntervalRef.current);
      countDownIntervalRef.current = undefined;
    }
  };

  // count down to next challenge refresh every second
  const startCountDown = () => {
    countDownIntervalRef.current = setInterval(() => {
      const remaningMs = unlockTimestampRef.current - Date.now();

      const secondsRemaining = Math.max(Math.floor(remaningMs / 1000), 0);

      setTimeToNextChallenge(secondsRemaining);

      if (secondsRemaining === 0 && countDownIntervalRef.current) {
        clearInterval(countDownIntervalRef.current);
      }
    }, 1000);
  };

  const startRefreshTimer = (seconds: number) => {
    refreshTimeoutRef.current = setTimeout(() => {
      fetchChallenge();
    }, seconds * 1000);
  };

  const fetchChallenge = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/challenges/today");

      if (!res.ok) {
        throw new Error(`Response not ok! ${res.status}`);
      }

      const {
        challenge,
        secondsToNextChallenge,
      }: { challenge: ChallengeResponse; secondsToNextChallenge: number } =
        await res.json();

      if (!challenge) {
        throw new Error(`No challenge was found!`);
      }

      setChallenge(challenge);

      clearTimers();

      // ui countdown using local time
      const localSeconds = getLocalTimeToNextChallenge();
      unlockTimestampRef.current = Date.now() + localSeconds * 1000;

      setTimeToNextChallenge(localSeconds);

      startCountDown();

      startRefreshTimer(secondsToNextChallenge);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();

    return () => clearTimers();
  }, []);

  return {
    challenge,
    timeToNextChallenge,
    isLoading,
    error,
  };
}
