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
    <div>
      <WavesurferPlayer
        height={100}
        waveColor={"violet"}
        url={url}
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        width={250}
      />

      <button type="button" onClick={onPlayPause}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
