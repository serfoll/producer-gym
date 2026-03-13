import { JsonValue } from "@prisma/client/runtime/client";
import type { TrackFeatures } from "./types";

export interface Challenge {
  title: string;
  description?: string | null;
  duration: number;
  activeDate: Date;
  blobUrl: string;
  referenceFeatures: TrackFeatures | JsonValue;
}

export interface ChallengeResponse extends Challenge {
  id: string;
}

export type DailyChallengeResponse = {
  challenges: ChallengeResponse[];
  todayChallengeId: string;
  nextChallengeAtUTC: Date;
  serverNowUTC: Date;
};
