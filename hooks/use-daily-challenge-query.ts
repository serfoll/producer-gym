"use client";

import type { DailyChallengeResponse } from "@/lib/challenge-types";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerTime } from "./user-server-time";

let refreshTimer: NodeJS.Timeout | null = null;
let prefetchTimer: NodeJS.Timeout | null = null;

async function fetchDailyChallenge(): Promise<DailyChallengeResponse> {
  const res = await fetch("/api/challenges/today", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch daily challenge! Status: ${res.status}`);
  }

  const challenge = await res.json();
  return challenge;
}

// cache result, deduplicate requests and share data across components
export function useDailyChallengeQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["daily-challenge"],
    queryFn: fetchDailyChallenge,
    staleTime: Infinity, // audio retchef at midnight of next day UTC
    refetchOnWindowFocus: true,
  });

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
  }, [query.data, queryClient, getServerNow]);

  return { ...query, serverOffset, getServerNow };
}
