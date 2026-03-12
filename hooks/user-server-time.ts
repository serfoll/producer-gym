"use client";

import { useMemo } from "react";

export function useServerTime(serverNowUTC?: Date) {
  const offset = useMemo(() => {
    if (!serverNowUTC) return 0;

    const server = new Date(serverNowUTC).getTime();
    const client = Date.now();

    return server - client;
  }, [serverNowUTC]);

  const getServerNow = useMemo(() => {
    return () => Date.now() + offset;
  }, [offset]);

  return { serverOffset: offset, getServerNow };
}
