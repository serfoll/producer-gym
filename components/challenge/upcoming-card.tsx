import { Lock } from "lucide-react";
import CountDownTimer from "./countdown-timer";

export default function UpcomingCard() {
  return (
    <div className="mb-3 grid w-fit mx-auto items-center rounded-xl p-2 bg-neutral-400 space-y-2">
      <h3 className="rounded-md text-center text-xl font-bold">Tomorrow</h3>
      <div className="flex items-center justify-center aspect-square bg-neutral-300 w-45 h-45 p-3 mx-auto rounded-lg shadow">
        <div className="p-4 w-fit mx-auto my-2 rounded-md">
          <Lock size={64} className="text-neutral-700" />
        </div>
      </div>
      <CountDownTimer />
    </div>
  );
}
