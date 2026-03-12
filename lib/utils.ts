import crypto from "node:crypto";

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export const generateEncryptedString = async (byte = 32): Promise<string> =>
  crypto.randomBytes(byte).toString("hex");

export const capitaliseScoreKeyString = (key: string): string => {
  const keyStr = key.split("Score")[0];
  return keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
};

export function getLocalTimeToNextChallenge() {
  const now = new Date();
  const tomorrowInMs = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  ).getTime();

  const remainingMs = tomorrowInMs - now.getTime();
  return Math.max(Math.floor(remainingMs / 1000), 0);
}

export function getUTCDate(daysToAdd = 0): Date {
  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysToAdd,
      0,
      0,
      0,
      0,
    ),
  );

  return today;
}

export function calculateTtl(): number {
  const now = new Date();
  const timeToNextDayUTC = getUTCDate(1).getTime();

  const ttl = Math.floor((timeToNextDayUTC - now.getTime()) / 1000);

  return Math.max(ttl, 1);
}

export function formatTime(seconds: number): { [key: string]: string } {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const secsStr = secs.toString().padStart(2, "0");
  const minsStr = mins.toString().padStart(2, "0");
  const hrsStr = hrs.toString().padStart(2, "0");

  return { hrsStr, minsStr, secsStr };
}
