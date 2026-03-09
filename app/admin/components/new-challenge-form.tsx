"use client";

import Form from "next/form";
import type { File } from "node:buffer";
import { useActionState, useState } from "react";
import type { ActionState, NewChallenge } from "@/lib/types";
import { addChallengeActionState } from "@/lib/actions";
import StatusDisplay from "./status-display";
import { addDays } from "date-fns";

const initialState: ActionState = null;

export default function NewChallengeForm() {
  const [state, formAction, pending] = useActionState(
    addChallengeActionState,
    initialState,
  );
  const data = state?.data as NewChallenge;
  const today = new Date();
  const tomorrow = addDays(
    new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
    1,
  )
    .toISOString()
    .split("T")[0];
  console.log("toISOString: ", tomorrow);

  const [track, setTrack] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const onFileUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const trackFile = e.target.files?.[0];
    setTrack(trackFile as File | undefined);

    // remove previous url associal with file
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (trackFile) {
      const _fileUrl = URL.createObjectURL(trackFile as Blob);
      setFileUrl(_fileUrl);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <Form
      action={formAction}
      className="grid bg-neutral-50 p-4 rounded-lg space-y-4 shadow"
      aria-describedby="formHelperText"
    >
      <StatusDisplay
        message={state?.message}
        state={state?.status}
        error={state?.error}
      />
      <label
        htmlFor="title"
        className="flex justify-between gap-4 items-center"
      >
        <span>
          Title<span className="text-red-400">*</span>:{" "}
        </span>
        <input
          type="text"
          name="title"
          id="title"
          required
          className="rounded border border-neutral-800 p-1.5 dark:border-neutral-300"
          defaultValue={data?.title}
        />
      </label>

      <label
        htmlFor="audioFile"
        className="flex justify-between gap-4 items-center"
      >
        <span>
          Track<span className="text-red-400">*</span>:
        </span>
        <input
          type="file"
          name="file"
          id="audioFile"
          accept="audio/wav, audio/mp3"
          required
          className="rounded border border-neutral-800 p-1.5 dark:border-neutral-300"
          onChange={onFileUpdate}
          defaultValue={track?.name}
          aria-describedby="fileInputHelper"
        />
      </label>
      <p className="mt-1 text-sm text-neutral-500" id="fileInputHelper">
        WAV/MP3 (Max 10mb)
      </p>
      <label
        htmlFor="activeDate"
        className="flex justify-between gap-4 items-center"
      >
        <span>
          Active Date<span className="text-red-400">*</span>:
        </span>
        <input
          type="date"
          name="active-date"
          id="activeDate"
          required
          className="rounded border border-neutral-800 p-1.5 dark:border-neutral-300"
          min={tomorrow}
          defaultValue={tomorrow}
        />
      </label>
      <p className="text-neutral-500" id="formHelperText">
        All fields marked with (<span className="text-red-400">*</span>) are
        reuired!
      </p>
      <button
        disabled={pending}
        type="submit"
        className="w-fit cursor-pointer rounded p-2 font-medium bg-indigo-100 hover:bg-indigo-400 hover:text-neutral-50"
      >
        Create Challenge
      </button>

      {fileUrl && track && (
        <div className="mt-4 flex items-center gap-4">
          <div>
            <audio src={fileUrl} controls>
              <track kind="captions" />
            </audio>
          </div>
          <button
            disabled={pending}
            type="reset"
            className="cursor-pointer rounded bg-red-300 p-2 font-medium text-neutral-100 hover:bg-red-600"
            onClick={() => {
              setFileUrl(undefined);
              setTrack(undefined);
            }}
          >
            Remove
          </button>
        </div>
      )}
    </Form>
  );
}
