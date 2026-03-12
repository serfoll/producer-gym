"use client";

import { DailyChallengeResponse } from "@/lib/challenge-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useServerTime } from "./user-server-time";

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

    const timeout = Math.max(0, next - now);

    const timer = setTimeout(() => {
      console.log("should refetch");
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
    }, timeout);

    return () => clearTimeout(timer);
  }, [query.data, queryClient, getServerNow]);

  return { ...query, serverOffset, getServerNow };
}
