// challenge-query-keys.ts

export const challengeKeys = {
  all: ["challenges"] as const,
  list: () => [...challengeKeys.all, "list"] as const,
  daily: () => [...challengeKeys.all, "daily"] as const,
  detail: (id: string) => [...challengeKeys.all, "detail", id] as const,
};
