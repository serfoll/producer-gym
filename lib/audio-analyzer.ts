import { spawn } from "node:child_process";
import { Essentia, EssentiaWASM } from "essentia.js";
import type EssentiaType from "../node_modules/essentia.js/dist/core_api";
import type { TrackFeatures } from "./types";

/*
 * Initialise Essentia
 */

let essentia: EssentiaType;

const getEssentia = () => {
  if (!essentia) {
    essentia = new Essentia(EssentiaWASM);
  }
  return essentia;
};

const SAMPLE_RATE = 44100;

/**
 * Decodes an audio file into raw Float32 PCM(Pulse-Code Modulation) samples using ffmpeg.
 *
 * Spawn an ffmpeg process that reads the audio file from the
 * provided URL and convert it into a mono Float32 PCM stream. The resulting
 * binary stream is collected from stdout and converted into a Float32Array,
 * which is the format expected by most DSP libraries (e.g., Essentia).
 *
 * ffmpeg flags used:
 * - `-i <url>`        : input audio source (can be local path or remote URL)
 * - `-f f32le`        : output format as raw 32-bit floating point PCM
 * - `-ac 1`           : force mono channel output
 * - `-ar <sampleRate>`: resample audio to the target sample rate
 * - `pipe:1`          : write decoded PCM stream to stdout
 *
 * The resulting Float32Array represents normalized audio samples in the range
 * approximately [-1.0, 1.0], suitable for feature extraction and analysis.
 *
 * @function async
 * @param url - string. URL or file path pointing to the source audio file.
 * @returns Promise<Float32Array> - A Float32Array containing decoded mono PCM
 * samples at the configured SAMPLE_RATE.
 *
 * @example
 * const signal = await decodeAudioToFloat32(blobUrl);
 *
 * @notes
 * - Requires ffmpeg to be installed and accessible in the system PATH.
 * - Audio is streamed directly from ffmpeg without writing temporary files.
 * - Each sample occupies 4 bytes (Float32), which is why the buffer length
 *   is divided by 4 when constructing the Float32Array.
 * - stderr output from ffmpeg is available for logging/debugging.
 */

async function decodeAudioToFloat32(url: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      url,
      "-f",
      "f32le",
      "-ac",
      "1",
      "-ar",
      SAMPLE_RATE.toString(),
      "pipe:1",
    ]);

    const chunks: Buffer[] = [];

    ffmpeg.stdout.on("data", (chunk) => {
      chunks.push(chunk);
    });

    ffmpeg.stderr.on("data", () => {
      // logs goes here
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject(new Error("ffmpeg decoding failed"));
        return;
      }

      const buffer = Buffer.concat(chunks);

      const floatArray = new Float32Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength / 4,
      );

      resolve(floatArray);
    });
  });
}

/**
 * Compute a normalized energy envelope from an audio signal.
 *
 * The input signal is split into overlapping frames and RMS energy is calculated
 * for each frame using Essentia. The resulting values are normalized and
 * reduced into evenly spaced buckets representing the track's energy curve.
 *
 * @function computeEnergyEnvelope
 * @param essentia - EssentiaType. Essentia instance used for DSP operations.
 * @param signal - Float32Array. Mono PCM audio samples.
 * @param buckets - number. Number of points to return in the energy envelope (default: 15).
 *
 * @returns number[] - Normalized energy values (0–1) representing the energy contour.
 */

function computeEnergyEnvelope(
  essentia: EssentiaType,
  signal: Float32Array,
  buckets = 15,
): number[] {
  const frameSize = 1024;
  const hopSize = 512;

  const rmsValues: number[] = [];

  for (let i = 0; i + frameSize <= signal.length; i += hopSize) {
    const frame = signal.slice(i, i + frameSize);

    // Convert Float32Array → VectorFloat
    const vector = essentia.arrayToVector(frame);

    const rms = essentia.RMS(vector).rms;

    rmsValues.push(rms);

    // Free WASM Memory
    vector.delete();
  }

  const max = Math.max(...rmsValues) || 1;

  // evenly spaced buckets across the whole signal
  const normalized = rmsValues.map((v) => v / max);

  const step = Math.floor(normalized.length / buckets);
  const envelope: number[] = [];

  for (let i = 0; i < buckets; i++) {
    envelope.push(normalized[i * step] ?? 0);
  }

  return envelope;
}

/**
 * Computes spectral centroid statistics from an audio signal.
 *
 * The signal is split into overlapping frames and the spectral centroid
 * is calculated for each frame using Essentia. The centroid represents
 * the "center of mass" of the frequency spectrum and is often used as a
 * measure of brightness in audio.
 *
 * @function computeSpectral
 * @param essentia - EssentiaType. Essentia instance used for DSP operations.
 * @param signal - Float32Array. Mono PCM audio samples.
 *
 * @returns { centroid: number, centroidStd: number }
 * - centroid: Mean spectral centroid across all frames.
 * - centroidStd: Standard deviation of centroid values.
 */

function computeSpectral(
  essentia: EssentiaType,
  signal: Float32Array,
): { centroid: number; centroidStd: number } {
  const frameSize = 1024;
  const hopSize = 512;

  const centroids: number[] = [];

  for (let i = 0; i + frameSize <= signal.length; i += hopSize) {
    const frame = signal.slice(i, i + frameSize);

    // Convert Float32Array → VectorFloat
    const vector = essentia.arrayToVector(frame);
    const centroid = essentia.Centroid(vector).centroid;

    centroids.push(centroid);

    // Free WASM Memory
    vector.delete();
  }

  const mean = centroids.reduce((a, b) => a + b, 0);

  const std = Math.sqrt(
    centroids.reduce((sum, v) => sum + (v - mean) ** 2, 0) / centroids.length,
  );

  return { centroid: mean, centroidStd: std };
}

/**
 * Analyzes an audio file and extracts DSP features used for scoring.
 *
 * The function decodes the audio into a Float32 signal and runs several
 * Essentia algorithms to compute musical features such as tempo, key,
 * energy envelope, and spectral centroid statistics.
 *
 * These extracted features are later stored and used to compare a user's
 * submission against the reference track.
 *
 * @function anaylizeAndExtractAudioFeatures
 * @param blobUrl - string. URL pointing to the uploaded audio file.
 *
 * @returns TrackFeatures - Structured feature set used for comparing tracks.
 * - tempo: Estimated BPM and confidence from beat tracking.
 * - key: Estimated musical key, mode (major/minor), and confidence.
 * - energy: Normalized energy contour across the track.
 * - spectral: Spectral centroid statistics representing tonal brightness.
 * - duration: Length of the audio signal in seconds.
 * - analysisVersion: Version tag for feature extraction logic.
 */

export async function anaylizeAndExtractAudioFeatures(
  blobUrl: string,
): Promise<TrackFeatures> {
  // Initial essentia instance
  const essentia = getEssentia();

  // Decode audio to Float32Array signal
  const signal = await decodeAudioToFloat32(blobUrl);

  // Convert (signal) Float32Array to Essentia VectorFloat
  const signalVector = essentia.arrayToVector(signal);

  // track duration
  const duration = signal.length / SAMPLE_RATE;

  //Tempo detection using beat tracking
  const rhythm = essentia.RhythmExtractor2013(signalVector);
  const ticks = essentia.vectorToArray(rhythm.ticks);

  const tempo = {
    bpm: rhythm.bpm,
    confidence: rhythm.confidence,
    onsetRate: ticks.length / duration,
  };

  // Rhythmic features
  const bpmIntervals = essentia.vectorToArray(rhythm.bpmIntervals);

  const rhythmFeatures = {
    onsetRate: ticks.length / duration,
    hfcMean:
      bpmIntervals.reduce((a: number, b: number) => a + b, 0) /
      bpmIntervals.length,
  };

  // Energy and loudness based dynamics metrics.
  const dynamic = essentia.DynamicComplexity(signalVector);
  const loudness = essentia.LoudnessEBUR128(signalVector, signalVector);

  const dynamics = {
    rmsMean: essentia.RMS(signalVector).rms,
    dynamicComplexity: dynamic.dynamicComplexity,
    integratedLoudness: loudness.integratedLoudness,
    loudnessRange: loudness.loudnessRange,
  };

  // Key detection using total profile analysis
  const keyResult = essentia.KeyExtractor(signalVector);
  const key = {
    estimatedKey: keyResult.key,
    mode: keyResult.scale,
    strength: keyResult.strength,
  };

  // Energy contour describing the structural energy distribution across the track.
  const structure = {
    energyEnvelope: computeEnergyEnvelope(essentia, signal),
  };

  // Spectral characteristics capturing brightness and spectral change over time.
  const spectralStats = computeSpectral(essentia, signal);
  const spectralFlux = essentia.Flux(signalVector);

  const spectral = {
    centroidMean: spectralStats.centroid,
    centroidStd: spectralStats.centroidStd,
    spectralFluxMean: spectralFlux.flux,
  };

  signalVector.delete();

  // Free up WASM Memory
  rhythm.ticks.delete();
  rhythm.bpmIntervals.delete();

  return {
    tempo,
    key,
    rhythm: rhythmFeatures,
    dynamics,
    spectral,
    structure,
    analysisVersion: "v1",
  };
}
