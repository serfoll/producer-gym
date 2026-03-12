"use client";

import { DailyChallengeResponse } from "@/lib/challenge-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

async function fetchDailyChallenge(): Promise<DailyChallengeResponse> {
  const res = await fetch("/api/challenges/today", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch daily challenge! Status: ${res.status}`);
  }

  const challenge = await res.json();
  return challenge;
}

function getServerOffset(serverNowUTC: Date): number {
  const server = new Date(serverNowUTC).getTime(); // server time to local time
  const client = Date.now();

  return server - client;
}

function createServerNow(offset: number): () => number {
  return () => Date.now() + offset;
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

  const serverOffset = useMemo(() => {
    if (!query.data) return;

    return getServerOffset(query.data.serverNowUTC);
  }, [query.data]);

  const getServerNow = useMemo(() => {
    return createServerNow(serverOffset as number);
  }, [serverOffset]);

  useEffect(() => {
    if (!query.data) return;

    const next = new Date(query.data.nextChallengeAtUTC).getTime() + 5000;
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
