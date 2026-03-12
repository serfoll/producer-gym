export default function CountDownTimer({
  nextChallengeAtUTC,
}: {
  nextChallengeAtUTC: Date;
}) {
  return (
    <div>
      <p className=" font-medium">
        Next challenge unlocks in:{" "}
        <span className="text-neutral-700 w-fit rounded p-2 bg-indigo-100 ">
          {/* hrsStr */}
        </span>
        :
        <span className="text-neutral-700 w-fit rounded p-2 bg-indigo-100 ">
          {/* minsStr */}
        </span>
        :
        <span className="text-neutral-700 w-fit rounded p-2 bg-indigo-100 ">
          {/*secsStr*/}
        </span>
      </p>
    </div>
  );
}
