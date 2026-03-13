//use-daily-challenge-query.ts

"use client";

import type { DailyChallengeResponse } from "@/lib/challenge-types";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerTime } from "./user-server-time";
import { challengeKeys } from "@/components/challenge/challenge-query-keys";

let refreshTimer: NodeJS.Timeout | null = null;
let prefetchTimer: NodeJS.Timeout | null = null;

async function fetchDailyChallenge(): Promise<DailyChallengeResponse> {
  const res = await fetch("/api/challenges/today", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch daily challenge! Status: ${res.status}`);
  }

  const challenges = await res.json();
  return challenges;
}

// cache result, deduplicate requests and share data across components
export function useDailyChallengeQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: challengeKeys.daily(),
    queryFn: fetchDailyChallenge,
    staleTime: Infinity, // audio retchef at midnight of next day UTC
    refetchOnWindowFocus: true,
  });

  const todayChallenge = query?.data?.challenges.find(
    (c) => c.id === query?.data.todayChallengeId,
  );

  const { serverOffset, getServerNow } = useServerTime(
    query.data?.serverNowUTC,
  );

  useEffect(() => {
    if (!query.data) return;

    const next = new Date(query.data.nextChallengeAtUTC).getTime();
    const now = getServerNow();

    const refreshTimeout = Math.max(0, next - now);
    const prefetchTimeout = Math.max(0, refreshTimeout - 5 * 60 * 1000); // preftch 5min before

    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    if (prefetchTimer) {
      clearTimeout(prefetchTimer);
    }

    prefetchTimer = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ["daily-challenge"],
        queryFn: fetchDailyChallenge,
      });
    }, prefetchTimeout);

    refreshTimer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
    }, refreshTimeout);

    query?.data.challenges.forEach((challenge) => {
      queryClient.setQueryData(challengeKeys.detail(challenge.id), challenge);
    });
  }, [query.data, queryClient, getServerNow]);

  return {
    ...query,
    todayChallenge,
    challenges: query?.data?.challenges ?? [],
    serverOffset,
    getServerNow,
  };
}
