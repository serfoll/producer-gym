import { TrackFeatures } from "./types";
import { clamp } from "./utils";

export function scoreTempo(a: TrackFeatures, b: TrackFeatures): number {
  const diff = Math.abs(a.tempo.bpm - b.tempo.bpm);

  const tolerance = 10; // tolerance window

  return clamp(1 - diff / tolerance);
}

export function submissionScore(
  reference: TrackFeatures,
  submission: TrackFeatures,
) {
  const tempoScore = scoreTempo(reference, submission);

  return { tempoScore };
}
