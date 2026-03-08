import type { TrackFeatures, Score } from "./types";
import { clamp } from "./utils";

function scoreTempo(a: TrackFeatures, b: TrackFeatures): number {
  const diff = Math.abs(a.tempo.bpm - b.tempo.bpm);

  const tolerance = 10; // tolerance window

  return clamp(1 - diff / tolerance);
}

// basic key score
function scoreKey(a: TrackFeatures, b: TrackFeatures): number {
  if (a.key.estimatedKey === b.key.estimatedKey && a.key.mode === b.key.mode) {
    return 1;
  }

  if (a.key.estimatedKey === b.key.estimatedKey) {
    return 0.7;
  }

  return 0;
}

// rhythm score
function scoreRhythm(a: TrackFeatures, b: TrackFeatures): number {
  const onsetDiff = Math.abs(a.rhythm.onsetRate - b.rhythm.onsetRate);
  const hfcDiff = Math.abs(a.rhythm.hfcMean - b.rhythm.hfcMean);

  const onsetScore = clamp(1 - onsetDiff / 3);
  const hfcScore = clamp(1 - hfcDiff / 1);

  return (onsetScore + hfcScore) / 2;
}

// dynamics score
function scoreDynamics(a: TrackFeatures, b: TrackFeatures): number {
  const rmsDiff = Math.abs(a.dynamics.rmsMean - b.dynamics.rmsMean);
  const loudnessDiff = Math.abs(
    a.dynamics.integratedLoudness - b.dynamics.integratedLoudness,
  );

  const rmsScore = clamp(1 - rmsDiff / 0.5);
  const loudnessScore = clamp(1 - loudnessDiff / 20);

  return (rmsScore + loudnessScore) / 2;
}

// spectral score
function scoreSpectral(a: TrackFeatures, b: TrackFeatures): number {
  const centroidDiff = Math.abs(
    a.spectral.centroidMean - b.spectral.centroidMean,
  );

  const fluxDiff = Math.abs(
    a.spectral.spectralFluxMean - b.spectral.spectralFluxMean,
  );

  const centroidScore = clamp(1 - centroidDiff / 2000);
  const fluxScore = clamp(1 - fluxDiff / 500);

  return (centroidScore + fluxScore) / 2;
}

// structure score
function scoreStructure(a: TrackFeatures, b: TrackFeatures): number {
  const envA = a.structure.energyEnvelope;
  const envB = b.structure.energyEnvelope;

  if (!envA.length || !envB.length) {
    return 0;
  }

  const length = Math.min(envA.length, envB.length);
  let error = 0;

  for (let i = 0; i < length; i++) {
    error += Math.abs(envA[i] - envB[i]);
  }

  const meanError = error / length;
  return clamp(1 - meanError);
}

// SCORING WEIGHTS
const WEIGHTS = {
  tempo: 0.2,
  key: 0.1,
  rhythm: 0.25,
  dynamics: 0.1,
  spectral: 0.1,
  structure: 0.25,
};

export function submissionScore(
  reference: TrackFeatures,
  submission: TrackFeatures,
): Score {
  const tempoScore = scoreTempo(reference, submission);
  const keyScore = scoreKey(reference, submission);
  const rhythmScore = scoreRhythm(reference, submission);
  const dynamicsScore = scoreDynamics(reference, submission);
  const spectraScore = scoreSpectral(reference, submission);
  const structureScore = scoreStructure(reference, submission);

  const overallScore =
    tempoScore * WEIGHTS.tempo +
    keyScore * WEIGHTS.key +
    rhythmScore * WEIGHTS.rhythm +
    dynamicsScore * WEIGHTS.dynamics +
    spectraScore * WEIGHTS.spectral +
    structureScore * WEIGHTS.structure;

  return {
    tempoScore: Math.round(tempoScore * 100),
    keyScore: Math.round(keyScore * 100),
    rhythmScore: Math.round(rhythmScore * 100),
    dynamicsScore: Math.round(dynamicsScore * 100),
    spectraScore: Math.round(spectraScore * 100),
    structureScore: Math.round(structureScore * 100),
    overallScore: Math.round(overallScore * 100),
  };
}
