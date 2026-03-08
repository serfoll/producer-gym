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

export function submissionScore(
  reference: TrackFeatures,
  submission: TrackFeatures,
) {
  const tempoScore = scoreTempo(reference, submission);
  const keyScore = scoreKey(reference, submission);

  return { tempoScore, keyScore };
}
