import prisma from "@/lib/services/prisma";

export default async function AdminPage() {
  const challenges = await prisma.challenge.findMany();

  return (
    <div>
      <h2>All Challenges</h2>
      <ul>
        {challenges.map((c) => (
          <li key={c.id}>
            <h3>{c.title}</h3>
            {c.description && <p>{c.description}</p>}
            <p>
              <span>status: </span> {c.isActive ? "true" : "false"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
