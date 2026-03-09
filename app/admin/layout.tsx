import Modal from "@/components/modal";
import NewChallengeForm from "./components/new-challenge-form";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <>
      <div className="container p-4 md:px-0 mx-auto">
        <header className="flex items-center justify-between">
          <h1 className="font-bold text-2xl md:text-3xl">Admin Panel</h1>
          <button
            type="button"
            className="cursor-pointer rounded bg-indigo-200 p-2 font-medium text-neutral-900 transition duration-150 hover:bg-indigo-400 hover:text-neutral-200 "
            popoverTarget="new-challenge-modal"
          >
            Create Challenge
          </button>
        </header>
        <main>{children}</main>
      </div>
      <Modal>
        <NewChallengeForm />
      </Modal>
    </>
  );
}
