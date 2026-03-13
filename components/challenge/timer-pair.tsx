import { memo } from "react";

const TimerDigit = memo(({ digit }: { digit: string }) => {
  return (
    <span className="flex px-2 py-px items-center justify-center rounded bg-indigo-100 text-lg font-semibold text-neutral-700">
      {digit}
    </span>
  );
});

export default function TimerPair({ timerStr }: { timerStr: string }) {
  const [left, right] = timerStr;

  return (
    <p className="flex gap-1">
      <TimerDigit digit={left} />
      <TimerDigit digit={right} />
    </p>
  );
}
