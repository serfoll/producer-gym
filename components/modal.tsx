"use client";

export default function Modal({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  // createPortal: render modal content inside #modal-root element
  return (
    <dialog
      className="w-full h-screen relative z-10 bg-transparent"
      id="new-challenge-modal"
      popover="auto"
    >
      <div className="h-full grid items-center justify-center bg-gray-900/40 dark:bg-neutral-50/40 transition-opacity">
        <div className="mb-4 grid w-fit grid-rows-[auto_1fr] rounded-xl bg-neutral-200 p-4">
          <button
            type="button"
            aria-label="close modal"
            className="w-fit aspect-square cursor-pointer place-self-start rounded-md mb-4 bg-transparent p-2 px-3 transition hover:bg-indigo-400/85 hover:text-white"
            popoverTarget="new-challenge-modal"
            popoverTargetAction="hide"
          >
            X
          </button>
          {children}
        </div>
      </div>
    </dialog>
  );
}
