"use client";

import type { File } from "node:buffer";
import Form from "next/form";
import { useActionState, useState } from "react";
import type { ActionState, NewChallge as NewChallenge } from "@/lib/types";
import { addChallengeActionState } from "@/lib/actions";

const initialState: ActionState = null;

export default function AdminPage() {
  const [state, formAction, pending] = useActionState(
    addChallengeActionState,
    initialState,
  );

  const data = state?.data as NewChallenge;

  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const onFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const _file = e.target.files?.[0];
    setFile(_file);

    // remove previous url associal with file
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (_file) {
      const _fileUrl = URL.createObjectURL(_file);
      setFileUrl(_fileUrl);
    } else {
      setFileUrl(undefined);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1>Admin Page</h1>
      <Form action={formAction} className="grid">
        {state?.message && (
          <div className="w-full h-12.5 bg-yellow-100 flex items-center px-4 font-medium my-2.5 rounded-xl">
            <p className="text-yellow-700">{state?.message}</p>
          </div>
        )}
        <label htmlFor="title" className="flex gap-4">
          <span>Challenge Title: </span>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="border border-neutral-800 dark:border-neutral-300 p-1.5 rounded"
            defaultValue={data?.title}
          />
        </label>

        <label htmlFor="audioFile" className="flex gap-4">
          <span>Choose file to upload:</span>
          <input
            type="file"
            name="file"
            id="audioFile"
            accept="audio/wav, audio/mp3"
            required
            className="border border-neutral-800 dark:border-neutral-300 p-1.5 rounded"
            onChange={onFileUpdate}
            defaultValue={data?.file?.name}
          />
        </label>

        <button
          disabled={pending}
          type="submit"
          className="cursor-pointer dark:bg-neutral-100 hover:dark:bg-neutral-200 dark:text-neutral-800 font-medium p-2 w-fit rounded"
        >
          Create Challenge
        </button>

        {!data && fileUrl && file && (
          <div className="flex items-center gap-4 mt-4">
            <audio src={fileUrl} controls>
              <track kind="captions" />
            </audio>
            <button
              disabled={pending}
              type="reset"
              className="bg-red-300 hover:bg-red-600 text-neutral-100 font-medium cursor-pointer p-2 rounded"
              onClick={() => {
                setFileUrl(undefined);
                setFile(undefined);
              }}
            >
              Remove
            </button>
          </div>
        )}
      </Form>
    </main>
  );
}
