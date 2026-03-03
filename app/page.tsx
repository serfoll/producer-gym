import prisma from "@/lib/data/prisma";

export default async function Home() {
  const challenges = await prisma.challenge.findMany();

  return (
    <main>
      <h1>Today's Challenge: {challenges[0].title}</h1>
    </main>
  );
}
