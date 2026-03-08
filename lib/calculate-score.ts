import type { TrackFeatures } from "./types";
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

export function submissionScore(
  reference: TrackFeatures,
  submission: TrackFeatures,
) {
  const tempoScore = scoreTempo(reference, submission);
  const keyScore = scoreKey(reference, submission);
  const rhythmScore = scoreRhythm(reference, submission);
  const dynamicsScore = scoreDynamics(reference, submission);

  return { tempoScore, keyScore, rhythmScore, dynamicsScore };
}
