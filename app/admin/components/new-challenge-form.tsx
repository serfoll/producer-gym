"use client";

import Form from "next/form";
import type { File } from "node:buffer";
import { useActionState, useState } from "react";
import { type ActionState, type NewChallenge, StatusState } from "@/lib/types";
import { addChallengeActionState } from "@/lib/actions";
import { useFormStatus } from "react-dom";

const initialState: ActionState = null;

const StatusDisplay = ({
  message,
  state: status,
  error,
}: {
  message: string | undefined;
  state?: StatusState;
  error?: Record<string, string>;
}) => {
  const { pending } = useFormStatus();

  return pending || message ? (
    <div
      className={`${status === StatusState.SUCCESS ? "bg-green-100" : status === StatusState.ERROR ? "bg-red-100" : "bg-yellow-100"} my-2.5 flex h-12.5 w-full items-center rounded-xl  px-4 font-medium`}
    >
      <p
        className={`${status === StatusState.SUCCESS ? "text-green-700" : status === StatusState.ERROR ? "text-red-700" : "text-yellow-700"}`}
      >
        {pending ? "Creating challenge.." : error ? error?.reason : message}
      </p>
    </div>
  ) : null;
};

export default function NewChallengeForm() {
  const [state, formAction, pending] = useActionState(
    addChallengeActionState,
    initialState,
  );

  const data = state?.data as NewChallenge;

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
    >
      <StatusDisplay
        message={state?.message}
        state={state?.status}
        error={state?.error}
      />
      <label htmlFor="title" className="flex justify-between gap-4">
        <span>Title: </span>
        <input
          type="text"
          name="title"
          id="title"
          required
          className="rounded border border-neutral-800 p-1.5 dark:border-neutral-300"
          defaultValue={data?.title}
        />
      </label>

      <label htmlFor="audioFile" className="flex justify-between gap-4">
        <span>Track:</span>
        <input
          type="file"
          name="file"
          id="audioFile"
          accept="audio/wav, audio/mp3"
          required
          className="rounded border border-neutral-800 p-1.5 dark:border-neutral-300"
          onChange={onFileUpdate}
          defaultValue={data?.file?.name}
        />
      </label>

      <label htmlFor="activeDate" className="flex justify-between gap-4">
        <span>Active Date:</span>
        <input
          type="date"
          name="active-date"
          id="activeDate"
          required
          className="rounded border border-neutral-800 p-1.5 dark:border-neutral-300"
        />
      </label>

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
