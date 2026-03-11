"use client";

import { TrackFeatures } from "@/lib/types";
import WavesurferPlayer from "@wavesurfer/react";
import { useState } from "react";
import type WaveSurfer from "wavesurfer.js";

export default function WavePlayer({
  challenge,
}: {
  challenge: { [key: string]: string | number | Date | {} };
}): React.ReactNode {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    wavesurfer?.playPause();
  };

  const {
    blobUrl,
    duration,
    referenceFeatures: features,
  }: {
    blobUrl: string;
    duration: number;
    referenceFeatures: TrackFeatures;
  } = challenge;

  return (
    <div className="grid">
      <WavesurferPlayer
        height={100}
        waveColor={"violet"}
        url={blobUrl as string}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="mb-4">
        <dl className="flex items-center justify-center gap-4">
          <div className="flex gap-0.5">
            <dt>BPM:</dt>
            <dd>{Math.round(features?.tempo?.bpm)}</dd>
          </div>
          <div className="flex gap-0.5 border-r border-l px-4 dark:border-neutral-200">
            <dt>KEY:</dt>
            <dd>{`${features?.key.estimatedKey} ${features?.key.mode}`}</dd>
          </div>
          <div className="flex gap-0.5">
            <dt>LENGTH:</dt>
            <dd>{duration}s</dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        onClick={onPlayPause}
        className="mx-auto min-w-20 cursor-pointer rounded bg-indigo-200 p-2 font-medium text-neutral-900 transition duration-150 hover:bg-indigo-400 hover:text-neutral-200"
      >
        {isPlaying ? "Pause" : "Listen"}
      </button>
    </div>
  );
}
