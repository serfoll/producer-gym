import { spawn } from "node:child_process";
import { Essentia, EssentiaWASM } from "essentia.js";
import type EssentiaTypes from "../node_modules/essentia.js/dist/core_api";

let essentia: EssentiaTypes;

const getEssentia = () => {
  if (!essentia) {
    essentia = new Essentia(EssentiaWASM);
  }
  return essentia;
};

export async function anaylizeAndExtractAudioFeatures() {
  const essentia = getEssentia();
  // prints version of essentia wasm backend
  console.log(essentia.version);

  // prints all the available algorithm methods in Essentia
  console.log(essentia.algorithmNames);
  return essentia;
}
