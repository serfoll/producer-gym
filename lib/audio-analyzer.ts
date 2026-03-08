import { spawn } from "node:child_process";
import { Essentia, EssentiaWASM } from "essentia.js";
import type EssentiaType from "../node_modules/essentia.js/dist/core_api";

//1. Initialise Essentia
let essentia: EssentiaType;

const getEssentia = () => {
  if (!essentia) {
    essentia = new Essentia(EssentiaWASM);
  }
  return essentia;
};

//2. Decode audio from url to Float32Array
const SAMPLE_RATE = 44100;

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

// 3. compute normalized RMS energy envelope.
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
    // free up up the WASM memory to prevent memory leak
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

//4. Compute spectral centroid stats
function computeSpectral(essentia: EssentiaType, signal: Float32Array) {
  const frameSize = 1024;
  const hopSize = 512;

  const frames = essentia.FrameGenerator(signal, frameSize, hopSize);
  const centroids: number[] = [];

  for (let i = 0; i + frameSize <= signal.length; i += hopSize) {
    const frame = signal.slice(i, i + frameSize);

    // Convert Float32Array → VectorFloat
    const vector = essentia.arrayToVector(frame);
    const centroid = essentia.Centroid(vector).centroid;

    centroids.push(centroid);
  }

  const mean = centroids.reduce((a, b) => a + b, 0);

  const std = Math.sqrt(
    centroids.reduce((sum, v) => sum + (v - mean) ** 2, 0) / centroids.length,
  );

  return { centroid: mean, centroidStd: std };
}

//5. Analyse audio and extract features
export async function anaylizeAndExtractAudioFeatures(blobUrl: string) {
  // initial
  const essentia = getEssentia();
  const signal = await decodeAudioToFloat32(blobUrl);
  const signalVector = essentia.arrayToVector(signal);

  //Tempo detection
  const rhythm = essentia.RhythmExtractor2013(signalVector);
  const tempo = {
    bpm: rhythm.bpm,
    confidence: rhythm.confidence,
  };

  // Key detection
  const keyResult = essentia.KeyExtractor(signalVector);
  const key = {
    estimatedKey: keyResult.key,
    mode: keyResult.scale,
    confidence: keyResult.strength,
  };

  const energyEnvelope = computeEnergyEnvelope(essentia, signal);
  const spectral = computeSpectral(essentia, signal);

  return { tempo, key, energy: { energyEnvelope }, spectral: spectral };
}
