import { spawn } from "node:child_process";
import { Essentia, EssentiaWASM } from "essentia.js";
import type EssentiaTypes from "../node_modules/essentia.js/dist/core_api";
import Ffmpeg from "fluent-ffmpeg";
import { resolve4 } from "node:dns";

//1. Initialise Essentia
let essentia: EssentiaTypes;

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

export async function anaylizeAndExtractAudioFeatures(blobUrl: string) {
  const essentia = getEssentia();

  const signal = await decodeAudioToFloat32(blobUrl);

  return signal;
}
