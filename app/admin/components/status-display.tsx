"use client";

import { useFormStatus } from "react-dom";
import { StatusState } from "@/lib/types";

export default function StatusDisplay({
  message,
  state: status,
  error,
}: {
  message: string | undefined;
  state?: StatusState;
  error?: Record<string, string>;
}) {
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
}
