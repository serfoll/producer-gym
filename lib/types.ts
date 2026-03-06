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
  tempo: { bpm: number; confidence: number; onsetRate: number };
  key: { estimatedKey: string; mode: string; strength: number };
  drumAccuracy: {
    hfcMean: number;
    beatsLoudnessMean: number;
    onsetRate: number;
  };
  mixAndEnergy: {
    rmsMean: number;
    dynamicComplexity: number;
    integratedLoudness: number;
    loudnessRange: number;
    spectralFluxMean: number;
  };
  energyEnvelope: number[];
};
