// this is just a type for the states in our ActionState
export type ActionState = {
  message: string;
  data: unknown;
  errors?: Record<string, string[]>;
} | null;

export type NewChallge = {
  title: string | undefined;
  file: File | undefined;
};

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
  analysisVersion: string;
};

export interface Score {
  [score: string]: number;
}
