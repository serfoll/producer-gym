import prisma from "@/lib/services/prisma";

export default async function Home() {
  const challenges = await prisma.challenge.findMany();

  return (
    <main>
      <h1>Today's Challenge: {challenges[0].title}</h1>
      <audio src={challenges[0].blobUrl} autoPlay controls>
        <track default kind="captions" />
      </audio>
    </main>
  );
}
