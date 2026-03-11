import { JsonValue } from "@prisma/client/runtime/client";
import type { ISOStringFormat } from "date-fns";

// this is just a type for the states in our ActionState
export enum StatusState {
  ERROR,
  SUCCESS,
  INFO,
}

export type ActionState = {
  message: string;
  data: unknown;
  status?: StatusState;
  error?: Record<string, string>;
} | null;

export interface NewChallengeData {
  title: string;
  description?: string;
  duration: number;
  activeDate: ISOStringFormat;
  blobUrl: string;
  referenceFeatures: TrackFeatures;
}

export interface ChallengeResponse {
  id: string | undefined;
  title: string | undefined;
  description?: string | null | undefined;
  duration: number | undefined;
  activeDate: Date | undefined;
  blobUrl: string | undefined;
  referenceFeatures: JsonValue | undefined;
}

export type TrackFeatures = {
  tempo: {
    bpm: number;
    confidence: number;
    onsetRate: number;
  };

  key: {
    estimatedKey: string;
    mode: string;
    strength: number;
  };

  rhythm: {
    onsetRate: number;
    hfcMean: number;
  };

  dynamics: {
    rmsMean: number;
    dynamicComplexity: number;
    integratedLoudness: number;
    loudnessRange: number;
  };

  spectral: {
    centroidMean: number;
    centroidStd: number;
    spectralFluxMean: number;
  };

  structure: {
    energyEnvelope: number[];
  };
  duration: number;
  analysisVersion: string;
};

export interface Score {
  [score: string]: number;
}
