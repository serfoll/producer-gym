"use client";

import WavesurferPlayer from "@wavesurfer/react";
import { useState } from "react";
import type WaveSurfer from "wavesurfer.js";

export default function WavePlayer({ url }: { url: string }): React.ReactNode {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    wavesurfer?.playPause();
  };

  return (
    <div className="grid">
      <WavesurferPlayer
        height={100}
        waveColor={"violet"}
        url={url}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button
        type="button"
        onClick={onPlayPause}
        className="cursor-pointer rounded bg-indigo-200 p-2 font-medium text-neutral-900 transition duration-150 hover:bg-indigo-400 hover:text-neutral-200 min-w-20 mx-auto"
      >
        {isPlaying ? "Pause" : "Listen"}
      </button>
    </div>
  );
}
